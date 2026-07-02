---
title: 拆除 RAID 和 LVM
date: 2026-03-08 23:15:00
updated: 2026-03-09 00:02:00
lang: zh-CN
permalink: /chai-chu-raid-he-lvm/
layout: post
category: tech-learned
tags: [raid, lvm, linux, mdadm, lvm2, fstab]
license: CC BY 4.0
description: 八步彻底拆除 RAID 和 LVM，恢复普通独立分区，使磁盘可正常休眠。
---

> 要拆除 RAID 和 LVM 结构，将磁盘恢复为普通独立分区，请按以下步骤操作。**请务必先确认数据已备份到安全位置**（例如 `/home` 或外部硬盘），因为过程中会删除所有分区和文件系统。

## 🛑 前提条件

- 确保你已经通过 `rsync` 或其他方式将 `/mnt/disk1`、`/mnt/disk2`、`/mnt/disk3` 中的数据完整备份到其他地方（如 `/home/backup/`）。
- 备份后可以卸载这些挂载点，并准备好执行下面的命令。

## 📦 第一步：卸载所有挂载点

```bash
sudo umount /mnt/disk1 /mnt/disk2 /mnt/disk3
```

## 🔧 第二步：停用并删除 LVM 组件

### (1) 停用逻辑卷

```bash
sudo lvchange -an /dev/trim_2abfb71e_7982_4d6d_ac4e_8f81d4533fff/0
sudo lvchange -an /dev/trim_3bd2bc87_9c09_4efc_993b_fdc489e2d0a9/0
sudo lvchange -an /dev/trim_2dfb11ee_bcf4_4117_8add_df84633db194/0
```

### (2) 删除逻辑卷

```bash
sudo lvremove /dev/trim_2abfb71e_7982_4d6d_ac4e_8f81d4533fff/0
sudo lvremove /dev/trim_3bd2bc87_9c09_4efc_993b_fdc489e2d0a9/0
sudo lvremove /dev/trim_2dfb11ee_bcf4_4117_8add_df84633db194/0
```

### (3) 删除卷组

```bash
sudo vgremove trim_2abfb71e_7982_4d6d_ac4e_8f81d4533fff
sudo vgremove trim_3bd2bc87_9c09_4efc_993b_fdc489e2d0a9
sudo vgremove trim_2dfb11ee_bcf4_4117_8add_df84633db194
```

### (4) 删除物理卷（即 RAID 设备）

```bash
sudo pvremove /dev/md0 /dev/md1 /dev/md2
```

## 🧹 第三步：停止并清除 RAID

### (1) 停止 RAID 阵列

```bash
sudo mdadm --stop /dev/md0
sudo mdadm --stop /dev/md1
sudo mdadm --stop /dev/md2
```

### (2) 清除分区上的 RAID 超级块

```bash
sudo mdadm --zero-superblock /dev/sda1
sudo mdadm --zero-superblock /dev/sdb1
sudo mdadm --zero-superblock /dev/sdc1
```

### (3) （可选）从 mdadm 配置文件中移除相关条目

```bash
sudo nano /etc/mdadm/mdadm.conf
```

删除或注释掉包含 `/dev/md0`、`/dev/md1`、`/dev/md2` 的行。保存后更新 initramfs：

```bash
sudo update-initramfs -u
```

## 💽 第四步：重新分区

现在 `/dev/sda`、`/dev/sdb`、`/dev/sdc` 上还保留着原来的分区表（例如 `/dev/sda1` 等）。我们需要删除这些分区，创建全新的分区表，并建立一个覆盖全盘的分区。

以 `/dev/sda` 为例，对其他两块盘重复操作。

```bash
sudo fdisk /dev/sda
```

在 fdisk 交互界面中：

- 输入 `d` 删除现有分区（如果只有一个分区，直接删除）。
- 输入 `n` 创建新分区，选择 `p` 为主分区，分区号 `1`，起始扇区默认，结束扇区默认（使用全部空间）。
- 输入 `w` 写入并退出。

对 `/dev/sdb` 和 `/dev/sdc` 执行相同操作。

完成后，你应该看到三个新分区：`/dev/sda1`、`/dev/sdb1`、`/dev/sdc1`。

## 📀 第五步：格式化新分区

你可以选择 ext4 或其他你喜欢的文件系统。这里以 ext4 为例：

```bash
sudo mkfs.ext4 /dev/sda1
sudo mkfs.ext4 /dev/sdb1
sudo mkfs.ext4 /dev/sdc1
```

> 注意：`/dev/sda1` 原先是 btrfs，如果你希望继续使用 btrfs，可以将 `mkfs.ext4` 换成 `mkfs.btrfs`。

## 📂 第六步：挂载并恢复数据

### 创建新的挂载点

```bash
sudo mkdir -p /mnt/newdisk{1,2,3}
```

### 临时挂载

```bash
sudo mount /dev/sdb1 /mnt/newdisk1 # 对应原来的 /mnt/disk1
sudo mount /dev/sdc1 /mnt/newdisk2 # 对应原来的 /mnt/disk2
sudo mount /dev/sda1 /mnt/newdisk3 # 对应原来的 /mnt/disk3
```

### 恢复备份的数据

假设你将数据备份到了 `/home/backup/disk1`、`/home/backup/disk2`、`/home/backup/disk3`：

```bash
sudo rsync -avP /home/backup/disk1/ /mnt/newdisk1/
sudo rsync -avP /home/backup/disk2/ /mnt/newdisk2/
sudo rsync -avP /home/backup/disk3/ /mnt/newdisk3/
```

## 🔗 第七步：配置开机自动挂载

获取新分区的 UUID：

```bash
sudo blkid /dev/sda1 /dev/sdb1 /dev/sdc1
```

编辑 `/etc/fstab`：

```bash
sudo nano /etc/fstab
```

在文件末尾添加类似下面的行（使用实际的 UUID 和挂载点）：

```
UUID=xxxx-xxxx-xxxx /mnt/newdisk1 ext4 defaults,noatime 0 2
UUID=yyyy-yyyy-yyyy /mnt/newdisk2 ext4 defaults,noatime 0 2
UUID=zzzz-zzzz-zzzz /mnt/newdisk3 ext4 defaults,noatime 0 2
```

保存退出。

测试挂载是否正常：

```bash
sudo mount -a
```

如果没有错误，说明配置正确。

## 🧪 第八步：验证休眠

现在磁盘已经是普通独立分区，没有 RAID/LVM 干扰。你可以重新配置 hd-idle，测试休眠：

```bash
# 编辑 hd-idle 配置
sudo nano /etc/default/hd-idle
```

确认包含：

```
START_HD_IDLE=true
HD_IDLE_OPTS="-i 0 -a sda -i 600 -a sdb -i 600 -a sdc -i 600"
```

重启服务：

```bash
sudo systemctl restart hd-idle
```

等待 10 分钟后，用 `sudo smartctl -i -n standby /dev/sdb` 检查，应该返回 `Device is in STANDBY mode`。

## ✅ 完成

现在你的磁盘已经彻底摆脱了 RAID 和 LVM，可以正常休眠了。如果遇到任何问题，欢迎随时追问。
