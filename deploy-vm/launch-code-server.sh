#!/bin/sh

# install code-server service system-wide
export HOME=/root
curl -fsSL https://code-server.dev/install.sh | sh

# add our helper server to redirect to the proper URL for --link
git clone https://github.com/bpmct/coder-cloud-redirect-server
cd coder-cloud-redirect-server
cp coder-cloud-redirect.service /etc/systemd/system/
cp coder-cloud-redirect.py /usr/bin/

# create a code-server user
adduser --disabled-password --gecos "" coder
echo "coder ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/coder
usermod -aG sudo coder

# copy ssh keys from root
cp -r /root/.ssh /home/Ajay/.ssh
chown -R coder:coder /home/Ajay/.ssh

# configure code-server to use --link with the "coder" user
mkdir -p /home/Ajay/.config/code-server
touch /home/Ajay/.config/code-server/config.yaml
echo "link: true" > /home/Ajay/.config/code-server/config.yaml
chown -R coder:coder /home/Ajay/.config

# start and enable code-server and our helper service
systemctl enable --now code-server@coder
systemctl enable --now coder-cloud-redirect