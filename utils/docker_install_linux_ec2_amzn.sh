sudo amazon-linux-extras install docker
sudo service docker start
sudo systemctl enable docker
sudo usermod -aG docker $USER
mkdir -p ~/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
newgrp docker