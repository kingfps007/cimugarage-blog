---
title: 飞牛转 LinuxNas
date: 2026-03-08 17:31:00
updated: 2026-03-09 00:14:00
lang: zh-CN
permalink: /fnos-to-linuxnas/
layout: post
category: tech-learned
tags: [nas, fnos, ubuntu, 1panel, docker, lvm, raid, mdadm, hd-idle, cockpit, v2raya]
license: CC BY 4.0
description: 从飞牛（fnOS）迁移至 Ubuntu 24.04.4 LTS Desktop + 1Panel + Docker 的全流程排错实录，覆盖备份、重装、恢复、挂载、休眠、代理、反代。
---

> 本教程基于一次完整的从飞牛（fnOS）系统迁移到 **Ubuntu 24.04.4 LTS Desktop + 1Panel + Docker** 开源生态的硬核实践整理而成。整个过程经历了**备份、重装、恢复、排错、优化** 的全流程，融入了长达数万字的对话中遇到的每一个「坑」和最终验证有效的解决方案。
>
> **本教程的最大特点**：它不是一份理想化的官方文档，而是一份真实的**排错实录**，涵盖了从底层磁盘挂载（飞牛复杂的 LVM/RAID 结构）、SSH 连接、1Panel 快照恢复，到硬盘休眠配置、Docker 代理设置、Cockpit 反代等所有实际操作细节。
>
> **适用场景**：飞牛系统（或其他 NAS 系统）迁移至 Ubuntu + 1Panel，希望保留原有数据，并搭建更强大、更可控的家庭服务器环境。

## 背景

这份教程基于一次完整的从飞牛（fnOS）系统迁移到 **Ubuntu 24.04.4 LTS Desktop + 1Panel + Docker** 开源生态的硬核实践整理而成。整个过程经历了**备份、重装、恢复、排错、优化** 的全流程，融入了长达数万字的对话中遇到的每一个「坑」和最终验证有效的解决方案。

**本教程的最大特点**：它不是一份理想化的官方文档，而是一份真实的**排错实录**，涵盖了从底层磁盘挂载（飞牛复杂的 LVM/RAID 结构）、SSH 连接、1Panel 快照恢复，到硬盘休眠配置、Docker 代理设置、Cockpit 反代等所有实际操作细节。

**适用场景**：飞牛系统（或其他 NAS 系统）迁移至 Ubuntu + 1Panel，希望保留原有数据，并搭建更强大、更可控的家庭服务器环境。

## 一、备份

### 1.1 1Panel 面板快照（最关键的一步）

在飞牛系统的 1Panel 中，**必须使用「面板快照」功能**，而不是普通的「网站备份」。普通的备份只包含网站文件，而**面板快照** 能完整备份：

- 网站配置（域名、Nginx 规则）
- 防火墙规则
- 计划任务
- 面板设置

**操作步骤**：

(1) 登录飞牛上的 1Panel → **面板设置** → **快照**
(2) 点击 **「创建快照」**，备份账号选择「服务器磁盘」
(3) 创建完成后，找到快照文件（通常在 `/opt/1panel/backup/snapshot`），**将其复制到你的数据盘或外部存储设备**（这一步非常重要，重装系统后会用到）

### 1.2 Docker 数据备份

1Panel 快照**不包含** Docker 容器的内部数据（如 Nextcloud 的文件、数据库等），需要单独备份：

```bash
# 查看 Docker 数据目录（默认为 /var/lib/docker）
docker info | grep "Docker Root Dir"

# 打包备份
sudo tar -czvf docker-backup.tar.gz /var/lib/docker
```

将打包文件也复制到外部存储。

### 1.3 记录关键信息

建议用笔记记录以下信息，恢复时能省去很多麻烦：

- 1Panel 网络信息（如 `1panel-network` 的子网、网关）
- 数据库密码、应用密钥
- 域名配置

## 二、安装 Ubuntu 桌面版（24.04.4 LTS）

### 2.1 制作启动盘

- 从清华镜像源下载：`ubuntu-24.04.4-desktop-amd64.iso`
- 使用 Rufus（Windows）或 `dd` 命令写入 U 盘

### 2.2 安装过程中的关键选择

(1) **分区**：如果你希望系统盘和数据盘分离，可以在安装时手动分区：

- EFI 分区：512MB
- `/`：建议 60-80GB（ext4）
- `/home`：剩余空间（ext4）——这样以后重装系统可以保留用户数据

(2) **用户信息**：设置用户名（如 `king`）、密码、主机名

(3) **软件选择**：**取消勾选**「安装第三方图形驱动」和「安装媒体编解码器」，保持系统最小化

### 2.3 安装后的第一件事：换源

Ubuntu 24.04 使用新的 DEB822 格式，编辑源文件：

```bash
# 备份原文件
sudo cp /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.list.d/ubuntu.sources.bak

# 编辑
sudo nano /etc/apt/sources.list.d/ubuntu.sources
```

替换为清华源内容：

```
Types: deb
URIs: https://mirrors.tuna.tsinghua.edu.cn/ubuntu/
Suites: noble noble-updates noble-security
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```

更新源：

```bash
sudo apt update && sudo apt upgrade -y
```

## 三、设置 SSH 远程连接（告别显示器）

Ubuntu 桌面版默认**只安装了 SSH 客户端，没有安装 SSH 服务端**，需要手动安装：

```bash
# 安装 SSH 服务端
sudo apt install openssh-server -y

# 启动并设置开机自启
sudo systemctl enable --now ssh

# 检查状态
sudo systemctl status ssh

# 如果防火墙开启，放行 SSH 端口
sudo ufw allow ssh
```

**此时就可以用另一台电脑的 PuTTY 或终端连接了**：

```bash
ssh 用户名@你的UbuntuIP
```

**避坑提醒**：如果连接失败，可能是防火墙或服务未启动。用 `sudo systemctl status ssh` 检查，若显示 `inactive`，用 `sudo systemctl start ssh` 启动。

## 四、安装 1Panel 并恢复快照

### 4.1 安装 1Panel

```bash
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh
sudo bash quick_start.sh
```

按提示设置 1Panel 端口、用户名、密码。

### 4.2 恢复 Docker 数据（先于面板快照恢复）

因为 1Panel 快照恢复时会尝试启动容器，所以需要先让 Docker 数据就位：

```bash
# 停止 Docker 服务
sudo systemctl stop docker

# 将备份的 docker-backup.tar.gz 解压覆盖
sudo tar -xzvf /path/to/docker-backup.tar.gz -C /

# 启动 Docker 服务
sudo systemctl start docker
```

### 4.3 恢复 1Panel 快照

(1) 登录 1Panel → **面板设置** → **快照**
(2) 点击 **「导入快照」**，选择之前备份的快照文件
(3) 等待导入完成，系统会自动重启 1Panel 服务

### 4.4 重建 1Panel 网络和修复应用

快照恢复后，可能会因为网络环境变化导致部分容器启动失败：

(1) **检查网络**：在 1Panel「容器-网络」中，查看是否存在 `1panel-network`。如果不存在，手动创建一个同名的 bridge 网络，填入之前记下的子网信息（如 `172.20.0.0/16`）

(2) **重建应用**：在「应用商店-已安装」中，对显示异常的应用逐个点击 **「重建」**。重建时会读取已存在的 Docker 数据，不会丢失配置

> **在重建之前，必须先配置好 Docker 代理，否则恢复后重建应用时可能无法拉取镜像！**
>
> 请先按照**第七阶段** 的方法配置好 Docker 代理（包括修改 `daemon.json`、重启 Docker、验证代理生效）。如果暂时无法配置代理，也可以使用离线导入镜像的方式（见第七阶段备选方案），但推荐优先配置代理。

## 五、挂载飞牛的「复杂」硬盘（LVM/RAID）

这是整个迁移中**最可能出现问题** 的环节，因为飞牛系统通常对每块硬盘都设置了**单盘 RAID + LVM**，导致在 Ubuntu 下不能直接挂载。

### 5.1 识别磁盘结构

```bash
sudo lsblk -f
```

你会看到类似这样的输出：

```
sda
└─sda1 linux_raid_member
 └─md0 LVM2_member
 └─卷组-逻辑卷 ext4
```

**这就是飞牛典型的单盘 RAID1 + LVM 结构**：每块物理盘先做成一个独立的 RAID1 阵列（虽然是单盘），然后再用 LVM 管理。

### 5.2 安装必要工具

```bash
sudo apt install mdadm lvm2 smartmontools sdparm -y
```

### 5.3 组装 RAID 并激活 LVM

```bash
# 扫描并组装所有可识别的 RAID
sudo mdadm --assemble --scan

# 查看组装的 RAID 设备
cat /proc/mdstat
# 应该看到类似 md0 : active raid1 sda1[0] 的输出

# 扫描并激活 LVM 卷组
sudo vgscan
sudo vgchange -ay

# 查看逻辑卷
sudo lvs
sudo lvdisplay
```

你会看到类似这样的逻辑卷路径：

- `/dev/trim_2abfb71e_7982_4d6d_ac4e_8f81d4533fff/0`
- `/dev/trim_3bd2bc87_9c09_4efc_993b_fdc489e2d0a9/0`
- `/dev/trim_2dfb11ee_bcf4_4117_8add_df84633db194/0`

### 5.4 挂载逻辑卷（数据无损）

```bash
# 创建挂载点
sudo mkdir -p /mnt/disk{1,2,3}

# 挂载（路径以实际 lvs 输出为准）
sudo mount /dev/trim_2abfb71e_7982_4d6d_ac4e_8f81d4533fff/0 /mnt/disk1
sudo mount /dev/trim_3bd2bc87_9c09_4efc_993b_fdc489e2d0a9/0 /mnt/disk2
sudo mount /dev/trim_2dfb11ee_bcf4_4117_8add_df84633db194/0 /mnt/disk3
```

### 5.5 验证数据

```bash
ls /mnt/disk1
ls /mnt/disk2
ls /mnt/disk3
```

如果能看见飞牛中的文件（如照片、视频），恭喜你——数据完好无损！

### 5.6 配置开机自动挂载（使用 UUID）

```bash
# 获取文件系统 UUID（不是 LVM 的 UUID）
sudo blkid /dev/trim_2abfb71e_7982_4d6d_ac4e_8f81d4533fff/0
sudo blkid /dev/trim_3bd2bc87_9c09_4efc_993b_fdc489e2d0a9/0
sudo blkid /dev/trim_2dfb11ee_bcf4_4117_8add_df84633db194/0
```

编辑 `/etc/fstab`：

```bash
sudo nano /etc/fstab
```

添加类似以下三行（替换 UUID 为实际值）：

```
UUID=06176f77-6bee-44c9-bd31-50276af711a4 /mnt/disk1 ext4 defaults,noatime 0 2
UUID=1e1a0d70-0e3f-444a-96e5-091d9b42b178 /mnt/disk2 ext4 defaults,noatime 0 2
UUID=f198112a-a62c-4184-b51b-ea478e07c97e /mnt/disk3 btrfs defaults,noatime 0 2
```

### 5.7 保存 RAID 配置（确保重启后自动组装）

```bash
sudo mdadm --detail --scan | sudo tee -a /etc/mdadm/mdadm.conf
sudo update-initramfs -u
```

**避坑提醒**：第三个盘可能是 btrfs 文件系统，这是飞牛默认格式，可以直接挂载使用，无需转换。挂载后检查文件系统类型，确保在 fstab 中填写正确。

## 六、硬盘休眠配置（保护机械盘）

使用 **hd-idle** 实现三块机械盘（sda、sdb、sdc）的自动休眠，并配置监控脚本记录健康状态。

### 6.1 安装 hd-idle

```bash
sudo apt update
sudo apt install hd-idle -y
```

### 6.2 配置自动休眠策略

编辑配置文件 `/etc/default/hd-idle`：

```bash
sudo nano /etc/default/hd-idle
```

修改为以下内容：

```
START_HD_IDLE=true
# -i 0 保证默认不休眠（避免影响系统盘）
# -a 后面紧跟硬盘 ID，-i 600 表示空闲 600 秒（10 分钟）后休眠
HD_IDLE_OPTS="-i 0 -a sda -i 600 -a sdb -i 600 -a sdc -i 600"
```

**参数解释**：

- `-i 0`：对其他未指定的磁盘不休眠
- `-a sda -i 600`：对 `/dev/sda` 设置 10 分钟无操作后休眠
- 同理为 sdb、sdc 设置

### 6.3 启动服务

```bash
sudo systemctl enable hd-idle
sudo systemctl start hd-idle

# 查看状态
sudo systemctl status hd-idle
```

### 6.4 测试休眠

```bash
# 立即强制休眠（测试用）
sudo hdparm -y /dev/sdb

# 查看硬盘状态（应显示 standby）
sudo hdparm -C /dev/sdb

# 查看 hd-idle 空闲计时器
sudo hd-idle -t sda
sudo hd-idle -t sdb
sudo hd-idle -t sdc
```

**注意**：`hd-idle -t` 是**显示空闲时间**，不是强制休眠。强制休眠用 `hdparm -y`。

### 6.5 创建硬盘健康监控脚本

创建一个脚本，定期记录三块盘的 SMART 数据，观察休眠效果和健康状态。

**脚本路径**：`/usr/local/bin/disk_health_monitor.sh`

```bash
#!/bin/bash

# ================= 配置部分 =================
DISKS=("/dev/sda" "/dev/sdb" "/dev/sdc")
LOG_FILE="/var/log/disk_health_monitor.log"
# =============================================

# 检查 smartctl 是否安装
if ! command -v smartctl &> /dev/null; then
  echo "$(date "+%Y-%m-%d %H:%M:%S") - 错误：未发现 smartctl，请先安装：sudo apt install smartmontools" | tee -a $LOG_FILE
  exit 1
fi

# 如果日志文件不存在，创建表头
if [ ! -f "$LOG_FILE" ]; then
  echo "时间 | 磁盘 | 运行小时 | 磁头起停(LCC) | 马达起停" > "$LOG_FILE"
  echo "------------------------------------------------------------" >> "$LOG_FILE"
fi

# 循环处理每个磁盘
for DISK in "${DISKS[@]}"; do
  if [ ! -b "$DISK" ]; then
    echo "$(date "+%Y-%m-%d %H:%M:%S") | $DISK | 磁盘不存在，跳过" >> "$LOG_FILE"
    continue
  fi

  DATE=$(date "+%Y-%m-%d %H:%M:%S")

  # 提取关键数据
  HOURS=$(sudo smartctl -a "$DISK" | grep "Power_On_Hours" | awk '{print $10}')
  LOAD_CYCLES=$(sudo smartctl -a "$DISK" | grep "Load_Cycle_Count" | awk '{print $10}')
  START_STOP=$(sudo smartctl -a "$DISK" | grep "Start_Stop_Count" | awk '{print $10}')

  [ -z "$HOURS" ] && HOURS="N/A"
  [ -z "$LOAD_CYCLES" ] && LOAD_CYCLES="N/A"
  [ -z "$START_STOP" ] && START_STOP="N/A"

  echo "$DATE | $DISK | $HOURS h | $LOAD_CYCLES | $START_STOP" >> "$LOG_FILE"
  echo "记录成功: $DATE | $DISK | $HOURS h | $LOAD_CYCLES | $START_STOP"
done
```

赋予执行权限并设置定时任务（例如每天凌晨 2 点记录）：

```bash
chmod +x /usr/local/bin/disk_health_monitor.sh

# 添加到 crontab
sudo crontab -e
# 添加一行
0 2 * * * /usr/local/bin/disk_health_monitor.sh
```

**避坑提醒**：

- LVM 可能会定期写入元数据，阻止磁盘休眠。如果发现硬盘始终不休眠，可以调整 LVM 配置（`/etc/lvm/lvm.conf` 中设置 `write_cache_state = 0`），但会影响性能，建议先观察。
- 使用 `iotop` 或 `iostat` 检查是否有进程频繁访问磁盘。

## 七、配置 Docker 局域网代理

由于网络环境限制，Docker 拉取镜像需要代理。你的局域网内有代理主机（IP：192.168.1.112，端口：7897）。

### 7.1 编辑 Docker 配置文件

```bash
sudo nano /etc/docker/daemon.json
```

确保内容如下（注意 JSON 语法，**最后一个花括号不能少**）：

```json
{
  "data-root": "/var/lib/docker",
  "live-restore": true,
  "log-driver": "json-file",
  "log-opts": {
    "max-file": "5",
    "max-size": "100m"
  },
  "proxies": {
    "http-proxy": "http://192.168.1.112:7897",
    "https-proxy": "http://192.168.1.112:7897",
    "no-proxy": "localhost,127.0.0.1,192.168.1.0/24"
  },
  "registry-mirrors": [
    "https://docker.xuanyuan.me",
    "https://registry.hub.docker.com",
    "https://docker.1panel.live"
  ]
}
```

**语法检查**：

- 确保每个大括号、方括号都正确闭合
- 最后一个条目后面不能有逗号

### 7.2 重启 Docker 服务

```bash
sudo systemctl restart docker
```

### 7.3 验证代理是否生效

```bash
# 查看 Docker 环境变量
sudo systemctl show --property=Environment docker

# 测试拉取镜像
docker pull hello-world
```

如果拉取成功，且代理主机上有对应日志，说明配置正确。

**避坑提醒**：

- **Windows 防火墙**：如果代理主机是 Windows，记得在防火墙中放行 7897 端口，允许局域网访问
- **代理软件设置**：确保代理软件（如 Clash、v2ray）开启了「允许局域网连接」

## 八、拉取 v2raya 镜像（备用代理方案）

如果后续需要更灵活的代理（如透明代理），可以安装 v2raya。

### 8.1 通过 apt 安装

```bash
# 添加官方源
wget -qO - https://apt.v2raya.org/key/public-key.asc | sudo tee /etc/apt/trusted.gpg.d/v2raya.asc
echo "deb https://apt.v2raya.org/ v2raya main" | sudo tee /etc/apt/sources.list.d/v2raya.list

# 安装
sudo apt update
sudo apt install v2raya -y

# 启动服务
sudo systemctl enable --now v2raya.service
```

### 8.2 访问 Web 界面

浏览器打开 `http://你的IP:2017`，创建管理员账号，导入节点即可。

### 8.3 配置 Docker 使用 v2raya 代理

v2raya 默认 HTTP 代理端口为 20171，可以修改 Docker 配置中的代理地址指向它：

```json
"proxies": {
  "http-proxy": "http://127.0.0.1:20171",
  "https-proxy": "http://127.0.0.1:20171"
}
```

v2raya 默认会开启 HTTP 代理端口（通常为 `20171`）和 SOCKS5 端口（`20170`）。如果你只是希望 Docker 通过代理拉取镜像，可以将 Docker 代理配置指向 `http://127.0.0.1:20171`。如果你开启了 v2raya 的**全局透明代理** 模式（例如使用 TPROXY），则无需额外配置 Docker 代理，所有流量会自动走代理。请根据你的实际需求选择。

## 九、安全检查与证书配置

### 9.1 检查防火墙

```bash
# 查看防火墙状态
sudo ufw status

# 放行必要端口（如 1Panel、SSH、HTTP/HTTPS）
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 9090/tcp # Cockpit 端口
```

### 9.2 1Panel 安全设置

- 登录 1Panel，修改默认端口（建议改为非标准端口）
- 开启面板登录验证码
- 定期检查「安全-防火墙」中的端口放行规则

### 9.3 SSL 证书申请

在 1Panel 中：

(1) 进入「网站」→「证书」→「申请证书」
(2) 选择 ACME 类型（如 Let's Encrypt）
(3) 填写域名、邮箱，自动申请证书
(4) 在网站设置中启用 HTTPS 并选择申请的证书

## 十、安装 Cockpit 并配置反向代理

### 10.1 安装 Cockpit

```bash
sudo apt install cockpit cockpit-storaged -y
sudo systemctl enable --now cockpit.socket
```

### 10.2 在 1Panel 中配置反向代理

(1) 在 1Panel「网站」中创建新站点，域名例如 `cockpit.你的域名.com`
(2) 启用 HTTPS，选择已申请的 SSL 证书
(3) 设置反向代理地址：`http://127.0.0.1:9090`

### 10.3 解决 Cockpit 反代后的访问问题

Cockpit 默认只允许通过 localhost 或与服务器主机名匹配的域名访问。通过反向代理访问时，需要修改 Cockpit 配置：

```bash
sudo nano /etc/cockpit/cockpit.conf
```

添加以下内容：

```ini
[WebService]
AllowUnencrypted = true
Origins = https://cockpit.你的域名.com http://cockpit.你的域名.com
```

重启 Cockpit 服务：

```bash
sudo systemctl restart cockpit
```

**避坑提醒**：

- 如果页面能打开但样式丢失，检查 Nginx 配置是否传递了正确的 Host 头
- 如果出现 403，通常是 `Origins` 配置未正确添加

### 10.4 安装 SMB 共享插件（Ubuntu 24.04 特供版）

> 官方源尚未支持 24.04，...
