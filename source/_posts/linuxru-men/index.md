---
title: linux 入门问题排查记录
date: 2026-03-07 15:37:00
updated: 2026-03-07 17:07:00
lang: zh-CN
permalink: /linuxru-men/
layout: post
category: tech-learned
tags: [linux, ubuntu, edge, gpu, hardware-accel, wayland]
license: CC BY 4.0
description: Ubuntu Edge 浏览器硬件加速问题排查记录——从开关、重启到驱动、权限的完整清单。
---

## 26.03.07 Edge 核显问题

大多数情况下，显卡驱动、用户权限在 Ubuntu 桌面版中已经配置妥当，问题只出在浏览器本身——硬件加速开关没开，或者开了之后没重启。

### 解决步骤

(1) **在 Edge 中开启硬件加速**

地址栏输入 `edge://settings/system`，确保「使用图形加速（如可用）」开关处于开启状态。

(2) **重启浏览器，或者注销当前用户重新登录**

关闭所有 Edge 窗口，重新打开即可生效。

如果仍无效，注销系统重新登录（让浏览器进程彻底重启）。

(3) **验证成果**

访问 `edge://gpu`，查看关键项是否变为 `Hardware accelerated`。

同时感受滑动网页是否流畅、CPU 占用是否下降。

### 如果还不行，再检查以下项目（极少需要）

| **检查项** | **命令/操作** |
|---|---|
| 确认显卡被系统识别 | `lspci  |  grep VGA` 应显示 Intel HD Graphics |
| 确认用户属于 render 组 | `groups` 应包含 `render`；否则执行 `sudo usermod -aG render $USER` 并注销 |
| 安装必要驱动（如有缺失） | `sudo apt install intel-media-va-driver-nonfree mesa-utils` |
| 强制 Edge 使用独立显卡（仅双显卡设备） | 在 `edge://flags` 中启用 `Override software rendering list` |

### 关于 Xorg 与 Wayland

你的系统默认使用 Wayland（`echo $XDG_SESSION_TYPE` 查看）。**不要为了 Edge 特意切换到 Xorg**，因为现代 Edge 对 Wayland 的支持已足够好，强行换 Xorg 可能引入新问题。

只要驱动正常、权限正确，Wayland 下 Edge 开启硬件加速后就能流畅运行。

### 总结

**先开开关，再重启。** 90% 的问题这一步就能解决。如果不行，再按清单排查驱动和权限，但概率极低。
