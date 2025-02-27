# tc-ui-eng

WebUI for [tcconfig](https://github.com/thombashi/tcconfig) which wraps
[TC(Linux Traffic Control)](https://lartc.org/howto/index.html) on Linux servers.

<img width="2000" alt="tcui" src="https://github.com/user-attachments/assets/50e07751-1ff9-4262-ace9-728b9d0fd77c">

## Usage

Ensure there is `ifb.ko` on your server:

```bash
ls /lib/modules/$(uname -r)/kernel/drivers/net/ifb.ko* 2>/dev/null && echo yes || echo no
```

Run TC WebUI using docker container:

```bash
docker run --network=host --privileged -it --restart always -d \
    --name tc -v /lib/modules:/lib/modules:ro rdeangel/tc-ui-eng:latest
```

you can also use the docker-conpose.yml.

> Note: Only support Linux server, because it requires kernel module ifb and host network mode.

Open [http://localhost:2023](http://localhost:2023) in your browser if running locally or your machine http://ip_address:2023.

## Concepts of TC

About the terminology of TC, see [Terminology](https://lartc.org/howto/lartc.qdisc.terminology.html).

```text
                Userspace programs
                     ^
                     |
     +---------------+-----------------------------------------+
     |               Y                                         |
     |    -------> IP Stack                                    |
     |   |              |                                      |
     |   |              Y                                      |
     |   |              Y                                      |
     |   ^              |                                      |
     |   |  / ----------> Forwarding ->                        |
     |   ^ /                           |                       |
     |   |/                            Y                       |
     |   |                             |                       |
     |   ^                             Y          /-qdisc1-\   |
     |   |                            Egress     /--qdisc2--\  |
  --->->Ingress                       Classifier ---qdisc3---- | ->
     |   Qdisc                                   \__qdisc4__/  |
     |                                            \-qdiscN_/   |
     |                                                         |
     +----------------------------------------------------------+
```

> Note: There is a note about this diagram in Chinese if you want, see [link](https://arthurchiao.art/blog/lartc-qdisc-zh/#4-%E6%9C%AF%E8%AF%AD).

The qdisc, handle and class is a hierarchy, but not the network path, see [Classful Queueing Disciplines](https://lartc.org/howto/lartc.qdisc.classful.html):

```text
          1:   root qdisc
           |
          1:1    child class
        /  |  \
       /   |   \
      /    |    \
      /    |    \
   1:10  1:11  1:12   child classes
    |      |     | 
    |     11:    |    leaf class
    |            | 
    10:         12:   qdisc
   /   \       /   \
10:1  10:2   12:1  12:2   leaf classes
```

The prio qdisc is a common used qdisc, see [The PRIO qdisc](https://lartc.org/howto/lartc.qdisc.classful.html):

```text
          1:   root qdisc
         / | \ 
       /   |   \
       /   |   \
     1:1  1:2  1:3    classes
      |    |    |
     10:  20:  30:    qdiscs    qdiscs
     sfq  tbf  sfq
band  0    1    2
```

[HTB](http://linux-ip.net/articles/Traffic-Control-HOWTO/classful-qdiscs.html) uses the concepts of tokens and buckets 
along with the class-based system and filters to allow for complex and granular control over traffic.

You can also use BPF in tc, see [Understanding tc “direct action” mode for BPF](https://qmonnet.github.io/whirl-offload/2020/04/11/tc-bpf-direct-action/) 
or [tea](https://github.com/winlinvip/tea#links-tc).

## Export and Load Docker Image

If want to export the docker image:

```bash
docker pull rdeangel/tc-ui-eng:latest
docker save rdeangel/tc-ui-eng:latest |gzip > tc-ui-eng.tar.gz
```

If want to download the arm64 docker image:

```bash
docker pull --platform linux/arm64 rdeangel/tc-ui-eng:latest
docker save rdeangel/tc-ui-eng:latest |gzip > tc-ui-eng.tar.gz
```

Load the docker image:

```bash
docker load -i tc-ui-eng.tar.gz
```

## HTTP OpenAPI

There is an HTTP OpenAPI, pass cmd in HTTP POST body, for example:

```bash
curl http://localhost:2023/tc/api/v1/config/raw -X POST -d 'tcshow lo'
```

Set 10% loss of interface lo:

```bash
curl http://localhost:2023/tc/api/v1/config/raw -X POST -d 'tcset lo --loss 10%'
#{"code":0,"data":null}
```

Get settings of interface lo:

```bash
curl http://localhost:2023/tc/api/v1/config/raw -X POST -d 'tcshow lo'
#{"code":0,"data":{"lo":{"incoming":{},"outgoing":{}}}}
```

Reset all settings of interface lo:

```bash
curl http://localhost:2023/tc/api/v1/config/raw -X POST -d 'tcdel --all lo'
#{"code":0,"data":null}
```

Only allow `tcset`, `tcshow` and `tcdel`, or failed:

```bash
curl http://localhost:2023/tc/api/v1/config/raw -X POST -d 'ls'
#{"code":100,"data":"invalid cmd ls"}
```

For TC command, see:

* [Set traffic control (tcset command)](https://tcconfig.readthedocs.io/en/latest/pages/usage/tcset/index.html)
* [Delete traffic control (tcdel command)](https://tcconfig.readthedocs.io/en/latest/pages/usage/tcdel/index.html)
* [Display traffic control configurations (tcshow command)](https://tcconfig.readthedocs.io/en/latest/pages/usage/tcshow/index.html)

Build UI:

```bash
(cd ui && npm install && npm run build)
# Or
(cd ui && npm install && npm run start)
```

Open http://localhost:3000/ in browser.

## Tools

Please install required tools, for Ubuntu20:

```bash
apt-get update -y
apt-get install -y curl tcpdump iputils-ping iproute2
curl -L https://golang.google.cn/dl/go1.16.12.linux-amd64.tar.gz |tar -xz -C /usr/local
export PATH=$PATH:/usr/local/go/bin
```

Please install tc and tcpdump:

```bash
sudo apt-get install -y iproute2 tcpdump
```

You can verify the installation by `tc qdisc help` and `tcpdump --version`.

Please install tcconfig:

```bash
# For Ubuntu20
sudo apt-get install -y python3-pip
sudo pip install tcconfig

# For CentOS7
sudo yum install -y python3-pip
sudo pip3 install tcconfig
```

You can verfiy the installation by `tcset --version`.

Please install Go 1.16+ by yourself and verfiy the installation by `go version`.

This is optional for docker.

## Config

Config by environment variables, so create a `.env` file with:

```bash
API_HOST=ubuntu20
API_LISTEN=2023
UI_HOST=localhost
UI_PORT=3001
NODE_ENV=development
IFACE_FILTER_IPV4=true
IFACE_FILTER_IPV6=true
```

This is optional.
