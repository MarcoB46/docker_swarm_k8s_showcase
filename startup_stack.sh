echo "----  init swarm  ----"
docker swarm init

echo "----  init creating secrets  ----"
echo "root" | docker secret create mongo_root -
echo "example" | docker secret create mongo_root_password -

echo "----  init creating networks  ----"
docker network create -d overlay frontend_net
docker network create -d overlay backend


