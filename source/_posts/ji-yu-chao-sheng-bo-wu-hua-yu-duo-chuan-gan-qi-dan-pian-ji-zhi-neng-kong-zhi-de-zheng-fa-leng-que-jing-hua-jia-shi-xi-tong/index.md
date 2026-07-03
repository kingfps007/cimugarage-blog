---
title: 基于超声波雾化与多传感器单片机智能控制的蒸发冷却净化加湿系统
date: 2026-05-14 11:13:00
updated: 2026-05-14 11:32:00
lang: zh-CN
permalink: /ultrasonic-humidifier/
layout: post
category: project-built
tags: [humidifier, ultrasonic, esp32, iot, homeassistant, hvac, air-purifier]
license: CC BY 4.0
description: 结合超声波雾化加湿与空气净化的智能化室内环境调节系统，含 ESP32C3 分布式控制、HomeAssistant 平台、多参数反馈自适应调节。
---

**摘要：**

本研究设计并实现了一种结合超声波雾化加湿与空气净化功能的智能化室内环境调节系统。系统采用模块化机械设计，通过高效过滤、等焓加湿和多参数送风控制，实现对室内温湿度及空气品质和舒适性的改善。创新性地将超声波雾化技术与空气净化模块集成，解决了传统无雾加湿器易滋生细菌、加湿效率低的问题。基于 ESP32C3 微控制器构建了分布式控制系统，采用 HomeAssistant 物联网平台实现多参数反馈与自适应调节。通过冬季实验验证，系统可将目标区域湿度从 16-20% 稳定提升至 30% 左右，CO₂ 浓度维持在 400ppm 以下，TVOC 浓度降低 70% 以上，响应时间大约 90 分钟。结果表明该系统具有良好的扩展性、能效比和空气处理效果，为室内环境精准调控提供了新的技术方案。

**关键词：** 超声波雾化；空气净化；智能控制；室内环境调节；蒸发冷却；物联网

## (1) 研究背景和现状

室内环境质量直接影响人体健康、舒适度和工作效率。传统集中式空调系统存在能耗高、调控不精准、难以满足个性化需求等问题<sup>[1]</sup>。特别是冬季供暖期间，室内空气干燥（相对湿度常低于 30%）会导致呼吸道不适、皮肤干燥等问题。

现有研究多集中于单一功能的空气处理设备，如独立加湿器或空气净化器。少数整合产品采用水帘蒸发技术，但其加湿量有限且存在加湿效率低、易滋生细菌、维护频繁等局限性<sup>[2][3]</sup>。本实验最初使用的加湿水帘在强制对流工况下就发生了此类问题（如图 1）。超声波雾化技术具有加湿效率高、响应快的优点，但传统应用缺乏有效的空气净化配合。在控制策略方面，基于物联网的智能环境控制系统逐渐成为研究热点，但多侧重于温度调控，对湿度与空气品质的协同控制研究不足<sup>[4][5]</sup>。

![滋生细菌和析出盐结晶的水帘](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-rudv.png)

**图 1** 滋生细菌和析出盐结晶的水帘

因此，本研究旨在开发一套可扩展的室内环境综合调节系统，主要研究内容为：

(1) 超声波雾化与空气净化的机械集成设计；
(2) 多参数反馈的智能控制系统架构。

主要创新为：

(1) 将超声波雾化技术与空气净化器集成并外置补水装置；
(2) 基于物联网平台实现温湿度、CO₂、VOC、颗粒物、光照、噪声、人状态等多参数的协同控制。

## (2) 实验系统设计

系统总体架构如图 2，硬件系统由空气处理和数据采集两部分构成，软件系统由单片机和服务器两个系统组成。

![系统总体框架](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-SWOv.png)

**图 2** 系统总体框架

以下是空气处理部分、数据采集部分和软件网络系统的具体设计。

### (1) 空气处理部分

空气处理部分由空气处理单元、输配单元、控制单元三个单元组成（如图 3）。

![空气处理部分组成单元](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-nnhA.png)

**图 3** 空气处理部分组成单元

#### 1) 空气处理单元

空气处理单元由高效过滤器、超声波加湿装置、轴流风扇三部分组成（如图 4a）。其中净化器外层无纺布用于去除粗大颗粒物，便于更换和延长滤芯寿命，HEPA 高效净化滤芯用于去除细颗粒物、微生物等污染物，同时内附活性炭吸附异味。

![空气处理单元组成部分](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-ITZI.png)

**a** 空气处理单元组成部分

超声波加湿装置由水位传感器、超声波换能器、循环对流风扇、上水管道出口四部分组成（如图 4b），各装置用 3D 打印机架固定。超声波换能器将水雾化为 1-5μm 分布均匀微粒，实现等焓加湿，雾化量约为 200mL/h，根据循环风扇与主风扇转速高低变化。水位传感器连接单片机用于控制外置水泵补给洁净水（见 2.1.2 控制单元）。

![超声波雾化装置结构](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-hpNH.png)

**b** 超声波雾化装置结构

**图 4** 空气处理单元结构图

#### 2) 空气处理部分控制单元

空气处理部分（如图 5a）由 ESP32C3 单片机、PWM 调速模块、超声波换能器开关、补水水泵开关四个模块和配套电源管路线路组成。ESP32C3 单片机用于处理所有数字信号和控制其他模块，雾化器和水泵采用低电平触发 NMOS 管模块控制开关，循环风扇采用 IR520 模块以 PWM 方式调速，主风扇直接用单片机输出 PWM 信号调速。由于传感器接入该单片机通信后，其与超声波换能器产生干扰导致单片机循环重启，采用多种方式隔离干扰均无效，故传感器设计为用额外单片机控制（2.2 数据采集部分）。

![控制单元模块](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-DwOC.png)

**a** 控制单元模块

![外置水桶](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-JuGf.png)

**b** 外置水桶

**图 5** 控制单元结构

系统采用分层控制策略（如图 6），首先采用 PID 调节风扇转速和雾化强度，其次基于环境参数和用户热舒适评价的模型化调节<sup>[6]</sup>，最后根据预测模型和人员活动模式优化运行参数。通过 EspHome 平台编译系统固件，通过 HomeAssistant 编译自动化配置文件并调用 Python 计算自适应模型实现实现上述控制策略。

![控制逻辑代码实现](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-kUko.png)

![控制逻辑代码实现](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-mAjt.png)

**图 6** 控制逻辑代码实现

#### 3) 输配单元

本系统采用可扩展管道设计，可根据应用场景灵活配置，例如总体积 ≤30m³ 的小空间采用直接送风；30-90m³ 的中型空间使用风管组织气流；100m³ 以上的空间与空调新风管道结合进行多点送风。

本实验搭建了最小模型，通过 4m 铝塑波纹管道送风至 5 m³ 的局部不密封空间，将局部空间与室内其他空间的各项空气参数进行对比。

### (2) 数据采集部分

数据采集部分（如图 7）由 ESP32C3 单片机、空气状态传感器、显示器组成，用于测量控制空间内空气状态，通过物联网平台与空气处理部分通信并显示空气和系统状态。

![数据采集部分模块](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-hDar.png)

**图 7** 数据采集部分模块

空气状态传感器型号如表 1。

**表 1 传感器配置**

| 传感器型号 | 测量参数 | 精度 | 采样频率 |
|---|---|---|---|
| BME280 | 温度、湿度 | ±0.5℃，±3%RH | 1Hz |
| SGP30 | CO₂、TVOC | ±15%(CO₂) | 1Hz |
| BH1750 | 光照强度 | ±5% | 0.5Hz |

### (3) 软件网络系统

本系统采用局域网（WLAN）无线通信，单片机系统固件采用 ESPHOME 平台配置编译，实现通信和基础自动化控制（如图 8a）；由网段内的服务器运行 HomeAssistant 平台（如图 8b），与空气处理和数据采集两部分单片机通信并进行多参数控制。

![ESPHOME 用户界面](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-jmge.png)

**a** ESPHOME 用户界面

![HomeAssistant 用户界面](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-PhJm.png)

**b** HomeAssistant 用户界面

**图 8** 软件网络系统用户界面

## (3) 实验方法与数据分析

### (1) 实验方法

实验在冬季供暖室内条件中进行，空气处理系统安装在室内靠近新风位置。测试期间环境温度 22±1℃，相对湿度 16-20%，湿球温度 13.5℃，室内和测试空间有正常人员活动。实验设置两组对照：

第一天零点开始系统关闭，记录环境自然变化；第二天零点开始系统启动，评估加湿和净化效果。每 30 分钟采集一次空间内和室内环境温湿度和空间内空气质量数据，连续采集 48 小时，计算对应舒适度和状态波动情况。

### (2) 实验数据和分析

相对湿度曲线如图 9a，空气质量曲线如图 9b，数据计算如表 2：

![温湿度对比曲线](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-LDFD.png)

**a** 温湿度对比曲线

![空气质量对比曲线](/assets/images/ji-yu-chao-sheng-bo-wu-hua-yu-duo-chuan-gan-qi-dan-pian-ji-zhi-neng-kong-zhi-de-zheng-fa-leng-que-jing-hua-jia-shi-xi-tong/图片-ZglT.png)

**b** 空气质量对比曲线

**图 9** 实验数据

**表 2 实验数据计算**

| **指标** | **系统关闭状态** | **系统开启状态** | **变化** |
|---|---|---|---|
| **空间内相对湿度（%RH）** | | | |
| 平均值 | 17.4 | 28.9 | 提高 11.5%RH |
| 最大值 | 18.6 | 31.2 | 提高 12.6%RH |
| 最小值 | 16.2 | 20.0 | 提高 3.8%RH |
| 标准差 | 0.72 | 0.83 | 波动性增加 15.3% |
| **CO₂ 浓度 (ppm)** | | | |
| 平均值 | 852 | 400 | 降低 452 (53.1%) |
| 最大值 | 1450 | 400 | 降低 1050 (72.4%) |
| 最小值 | 450 | 400 | 降低 50 (11.1%) |
| 标准差 | 298 | 0 | 降低到无波动 |
| **TVOC 浓度 (ppb)** | | | |
| 平均值 | 1052 | 462 | 降低 590ppb (56.1%) |
| 最大值 | 1650 | 700 | 降低 950ppb (57.6%) |
| 最小值 | 620 | 180 | 降低 440ppb (71.0%) |
| 标准差 | 345 | 155 | 波动性降低 55.1% |

#### 1) 加湿性能分析

由于空气输配单元管路较长，输送过程中管壁与室温气体充分换热，导致局部空间出风口温度与室内其他空间温度相近，因此可直接对比系统开启前后的局部空间的相对湿度<sup>[7]</sup>。实验数据说明，系统启动后，局部空间湿度从初始 20%RH 一次上升，90 分钟后达到 30%RH，随后维持波动范围在 ±2%RH 左右。

在相同体积下与传统水帘加湿器相比，本系统具有明显优势。

但根据蒸发冷却理论计算，在冬季室内 24℃ 条件下，将空气从 20%RH 加湿到 30%RH，每立方米空气需要蒸发约 1.2g 水。系统设计加湿量为 200g/h，根据补水系统实测加湿量为 170g/h，理论上应在 8 分钟内完成加湿。实际用时 90 分钟而且湿度无法继续增加，主要原因如下：

(1) 局部空间密封性不足且人员活动，水蒸气发生大量扩散，同时外部空间内空气流通且其他物品吸附水蒸气导致实际用时远大于理论；
(2) 受限于空间、循环风扇噪声限制以及系统气流组织，系统未能及时将饱和水蒸气与吸入空气混合均匀，导致处理后的空气温度接近湿球温度，饱和蒸气压过低，质扩散速率低，含湿量仍不足，加湿效率低；
(3) 传感器存在响应延迟，同时受局部空间的气流组织影响。

#### 2) 净化性能分析

系统开启后，CO₂ 浓度迅速从波动状态（400-1500ppm）稳定在 400ppm（传感器下限），TVOC 浓度从 400-3000ppb 降至 700ppb 以内，平均降幅达 71.3%，符合健康空气质量要求。

#### 3) 控制性能和舒适性分析

在 24 小时连续运行测试中，系统能将相对湿度维持在 30±2%RH 范围内，温度在 20-23℃ 范围内，无影响休息的噪音和吹风感。舒适度等级 PPD 相较处理前降低 20% 左右。

#### 4) 能耗分析

实验系统正常运行总功耗约为 30W，主要分布在：

(1) 超声波雾化器：15W
(2) 送风风扇和循环风扇共：10W
(3) 单片机控制与传感器：5W，其中不计入服务器功率，根据选型服务器最低功率可为 10W。

实验系统全部采用 DC12V 直流输入，根据实际运行情况功耗在 25W-35W 波动，说明单个最小模块功耗平均值为 30W，蒸发效率为 5.67g/W，具有较高能效。

## (4) 实验结论与应用分析

本系统相比传统方案具有如下优势：

(1) 机械结构设计方面，超声波雾化产生纯净水雾配合 HEPA 高效过滤器，避免了传统水帘系统易滋生细菌和清洗维护频繁的问题
(2) 系统采用模块化设计支持灵活配置，适应不同规模空间。例如与空气能热泵串联，对室内温湿度进行联合调控，提高显热后同时提高等焓加湿量进行空气全热控制；
(3) 控制系统方面，采用多参数反馈与智能算法结合，实现精细化调控提升舒适度。

本系统当前系统存在以下局限性：

(1) 单个最小模块最大加湿量仅为 170mL/h，大空间应用需多模块并联或增加体积和功率；
(2) 超声波雾化对水质要求高，需要搭配净水器安装或外置纯净水箱/桶。

综上，本研究为室内空气质量改善和加湿提供了新的路径，基于多参数联合控制能有效提升干燥地区室内空间内的热舒适性，同时具有维护简单、能效高、便于集成的特点，具有良好的应用前景。

## 参考文献

[1] ASHRAE. ASHRAE Handbook: Fundamentals[M]. Atlanta: ASHRAE, 2021.

[2] Zhang L, Li X, Wang H. A review of air humidification technologies for indoor environments[J]. Building and Environment, 2020, 180: 107035.

[3] Chen J, Liu Y, Sun Y. Performance comparison of ultrasonic and evaporative humidifiers in residential buildings[J]. Energy and Buildings, 2021, 231: 110612.

[4] Wang Q, Li N, Liu S. IoT-based smart indoor environment control systems: A review[J]. Sustainable Cities and Society, 2022, 76: 103438.

[5] T. (Tim) Zhang, S. Wang, G. Sun, L. Xu, and D. Takaoka, "Flow impact of an air conditioner to portable air cleaning," *Build. Environ.*, vol. 45, no. 9, pp. 2047–2056, Sep. 2010, doi: 10.1016/j.buildenv.2009.11.006.

[6] O. P. Emenuvwe, U. A. Umar, S. Umaru, and A. N. Oyedeji, "Development and performance evaluation of an intelligent air purifier/humidifier using fuzzy logic controller," Int. J. Low-Carbon Technol., vol. 18, pp. 82–94, Feb. 2023, doi: 10.1093/ijlct/ctad004.

[7] T. Ke, X. Huang, and X. Ling, "Numerical and experimental analysis on air/water direct contact heat and mass transfer in the humidifier," Appl. Therm. Eng., vol. 156, pp. 310–323, Jun. 2019, doi: 10.1016/j.applthermaleng.2019.04.051.
