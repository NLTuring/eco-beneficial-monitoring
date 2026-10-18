# 益望 (YiWang) · 农林有益生物多模态智能监测与生态服务决策系统

![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/3D-Three.js%20Scene-000000?logo=threedotjs&logoColor=white)
![Ecology](https://img.shields.io/badge/Domain-Multimodal%20Biodiversity%20%26%20AI-2E7D32)

> 让农田与森林里的有益生物“看得见、算得清、管得住”——面向传粉昆虫与天敌群落的多模态监测与生态服务价值核算平台。

**益望（YiWang）** 改变传统农林植保仅针对“害虫”测报的单一视角，以**传粉者（蜜蜂/熊蜂/野生蜂）与天敌昆虫（瓢虫/草蛉/食蚜蝇/寄生蜂）等有益生物群落**为核心监测主体。系统融合**边缘声学传感（振翅频谱/鸟鸣）、视觉识别、蜂箱传感与微气象数据**，将群落动态实时换算为可核验的**授粉与生物控害生态服务功能量**，并生成低干扰农事调控决策。

---

## 核心特性

- **多模态群落感知与三维样地可视化**
  - 基于 React 19 + Three.js 构建农林样地三维态势工作台，融合声学节点、视觉节点、蜂箱称重与微气象站点数据流。
  - 按生态功能群（传粉昆虫、捕食性天敌、寄生性天敌、食虫鸟类）实时统计群落丰度与时空活跃热区。
- **生态服务价值定量核算引擎**
  - 将监测到的访花频率、天敌-害虫比等生物指标映射为授粉增产贡献度与生物控害折算价值，输出可视化核算报表。
- **可追溯的农事调控辅助决策**
  - 结合有益生物活跃时段与微气象窗口，生成施药避让时间窗、天敌释放配比与栖息地生境管理建议，每条决策均绑定观测证据链。

---

## 快速启动

环境要求：Node.js 20+。

```bash
npm ci
npm run dev
```

浏览器访问 `http://127.0.0.1:5173/` 进入交互工作台。

### 构建与预览

```bash
npm run build
npm run preview
```

---

## 目录结构

```text
eco-beneficial-monitoring/
├── src/            # React 19 + Three.js 监测决策工作台前端源码
├── 3Dmodels/       # 农林生态监测节点与场景三维模型资产
├── public/         # 静态资源与多模态样例数据
├── docs/           # 多模态融合架构、生态服务核算模型与技术方案文档
└── tools/          # 工程辅助工具脚本
```
