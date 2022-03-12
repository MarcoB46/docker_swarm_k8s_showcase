# Docker Compose, Docker Swarm and k8s showcase example
This project is a showcase for **Docker**, the utility **Docker Compose** , the native Orchestration Tool **Swarm** and the popular Orchestrator tecnology **Kubernetes**. <br>Some of the tecknologies used in this project are:
- NodeJS Express WebServer;
- mongoDB;
- Apache Webserver;
----------
The project is divided into 3 services as follow:
- a mongoDB database to keep storage of a simple list of data;
- a NodeJs Express WebServer, which communicates with the database through a dedicated subnetwork, listening on this following endpoints:
    - **/ping**: return a JSON in the following format
        - _id: is an auto-generated identifier created by the mongoDB database;
        - hostname: is the container identifier created by Compose, Swarm or Kubernetes;
        - counter: number of times of which the route /ping has been requested and the container named `hostname` responded;

    ```json
    { "_id": "620d6587b37bed06dc3e67ea", "hostname": "8f2dc94f0504", "counter": 3 }
    ```
    If the container has not made a connection to the DB yet, only `hostname` is valorized and a new property, `status`, is present with the value **pending**.

    - **/kill**: execute a `NodeJS.Process.kill` call that will arrest the responding container, the response to this call have the following structure:<br>
   ```json
   {"hostname":"8f2dc94f0504","status":"killed"}
   ```

- a frontend page, which communicates with the Express Webserver through a dedicated subnetwork, created with **VueJs** and **Vuetify**. This page is build using the Vue-CLI `build` command and served with an **Apache** webserver to the final user. This WebApp make possible to execute the call to the endpoint descrived above.<br>
----------

## Utils
Some utility scripts are present inside the **utils** folder. Those scripts could be used to install Docker on an Ubuntu distribution (**docker_install_linux.sh**), Amazon EC2 Instance (**docker_install_linux_ec2_amzn.sh**), and install the docker compose utility.

----------
## Dockerfiles
### Server
Located inside the /server/ folder, this file describe the creation of the image used for the **server** container. It uses some of the best pratices indicated by the NodeJS on Docker guide like the use of the **node** user in order to run code whith an unprivileged user. The installation of the dependencies is execured by this command<br>
`RUN npm install --no-optional && npm cache clean --force`<br>

this is done before copiyng the source code in this image so the first part will be cache-preserved in future build making the build process faster. Another key aspect is the use of the **ENTRYPOINT** whitch make possible to create ENV variables starting command argouments or file contents, useful to inject the secrets inside the ENV of a container, if a secret is present.

### Frontend
Located inside the /frontend/interrogator/ folver, this file describe the creation of the image used for the **frontend** container. This is a **two stage Dockerfile**. The first one is similar to the one used for the Server image, the output of this stage, the builded resources for the webapp, is then transferred to the second stage by the command<br>
`COPY --from=0 /opt/node_app/app/dist/ /usr/local/apache2/htdocs/`<br>

Other files are also copied in the final stage, such as config files needed to allow CORS request or in order to implement a reverse Proxy in order to make the frontend page (within the external network) comunicate to the Server service (inside the network managed by Docker, not accessible directly from outside).

----------

## Docker Compose
The file **docker-compose.yml** manages all the properties to be runned with development in mind. For the Server service the command is overwritten by the use of the **nodemon** technology, which is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected, in this case, order to achieve that capability, the source files are mapped with a binding volume. This service depends on the Database one, with the condition that this last one is running "healthy", following the definitions for the healthcheck described that the file indicates. <br>
In order to bring all of the services up and running the following command is used:<br>
```console
docker compose -f .\docker-compose.yml -p nodemongo up -d --build
```
The page will be accessible to the http://localhost:80/ URL.
It is possible to delete the container created with :<br>
```console
docker compose -f .\docker-compose.yml -p nodemongo down  
```
## Docker Stack 
The docker-stack.yml manages all the properties to run all the services in Swarm mode. It uses the images hosted on Docker Hub of the Dockerfile described above:
- mbongiovanni94/stresstestexample:1.00.000
- mbongiovanni94/stresstestfrontend:1.00.001


In order to facilitate the creation of the Swarm and the needed resources a **startup_stack.sh** file is also present. It will initiate the Swarm, create the secrets for the DB user and passwords and create the two networks needed, one used by server and backend and the other used by the frontend and the server.<br>
It's possible to launch the docker [Docker Swarm Visualizer](https://github.com/dockersamples/docker-swarm-visualizer) by launching from a swarm leader node the following command:
```console
docker run -it -d -p 8088:8080 -v /var/run/docker.sock:/var/run/docker.sock dockersamples/visualizer
```



## k8s
The files located inside the **/kompose** folder were generated from the docker-stack.yml file using the [Kompose](https://kompose.io/) utility using the following command:<br>
```console
kompose convert -f docker-stack.yml -o kompose
```
The output is the followind list of files:
- backend-networkpolicy.yaml
- database-deployment.yaml
- database-service.yaml
- frontend-deployment.yaml
- frontend-networkpolicy.yaml
- frontend-service.yaml
- server-deployment.yaml
- server-service.yaml

**NOTE:** The file database-secret.yaml instead has been created manually in order to overcome the incompatibility for Kompose to convert external secrets, used in the docker-stack.yaml configuration. <br>

Those configuration have been used to generate the final configurations files. Which are present in **/k8s** folder. 
The server and frontend service/deploy were created using the following commands:

```console
k create deployment server --image=mbongiovanni94/stresstestexample:1.00.000 -o yaml --port=3000
k expose deployment server --type=ClusterIP --port=3000 --name=server -o yaml

k create deployment frontend --image=mbongiovanni94/stresstestfrontend:1.00.001 -o yaml
k expose deployment frontend --type=NodePort --port=80 --name=frontend -o yaml

```

in order to apply those configuration to a k8s cluster it's possible to use the following command:
```console
k apply -f k8s/
```

The application will be visible to http://localhost:30446

----------
## Elastic Kubernetes Service
It's possible to deploy a cluster on kubernetes instance given by different vendor, one example of which is Amazon's managed Kubernetes service for EC2, **EKS**. A tool named [eksctl](https://eksctl.io/) can be used to achive this goal. A configuration file, **eks_cluster.yml**, is used to obtain the information needed in order to create a cluster.<br>Is it possible to use the following command in order to do so:
```console
eksctl create cluster -f eks_cluster.yml
```
The deploy could take some minutes, once it's done it is possible to apply the k8s entities with the command present above in the relative section.<br>
It's possible to obtain stack information using the command
```console
kubectl get all -o wide
```
It is possible to delete the stack in any moment by giving
```console
eksctl delete cluster -f eks_cluster.yml
```
----------

@MarcoB46 - Marco Bongiovanni - marco.bongiovanni94@gmail.com