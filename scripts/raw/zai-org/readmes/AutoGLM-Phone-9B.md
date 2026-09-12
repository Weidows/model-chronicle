---
license: mit
language:
- zh
base_model:
- zai-org/GLM-4.1V-9B-Base
pipeline_tag: image-text-to-text
tags:
- agent
library_name: transformers
---

# AutoGLM-Phone-9B

<div align="center">
<img src="https://raw.githubusercontent.com/zai-org/Open-AutoGLM/refs/heads/main/resources/logo.svg" width="20%"/>
</div>

<p align="center">
    👋 Join our <a href="https://raw.githubusercontent.com/zai-org/Open-AutoGLM/refs/heads/main/resources/wechat.jpeg" target="_blank">WeChat</a> community
</p>

> ⚠️ This project is intended **for research and educational purposes only**.  
> Any use for illegal data access, system interference, or unlawful activities is strictly prohibited.  
> Please review our [Terms of Use](https://raw.githubusercontent.com/zai-org/Open-AutoGLM/refs/heads/main/resources/privacy_policy.txt) carefully.

## Project Overview

**Phone Agent** is a mobile intelligent assistant framework built on **AutoGLM**, capable of understanding smartphone screens through multimodal perception and executing automated operations to complete tasks.  
The system controls devices via **ADB (Android Debug Bridge)**, uses a **vision-language model** for screen understanding, and leverages **intelligent planning** to generate and execute action sequences.

Users can simply describe tasks in natural language—for example, *“Open Xiaohongshu and search for food recommendations.”*  
Phone Agent will automatically parse the intent, understand the current UI, plan the next steps, and carry out the entire workflow.

The system also includes:
- **Sensitive action confirmation mechanisms**
- **Human-in-the-loop fallback** for login or verification code scenarios
- **Remote ADB debugging**, allowing device connection via WiFi or network for flexible remote control and development

## Model Usage

We provide an open-source model usage guide to help you quickly download and deploy the model.  
Please visit our **[GitHub](https://github.com/zai-org/Open-AutoGLM)** for detailed instructions.

- The model architecture is identical to **`GLM-4.1V-9B-Thinking`**.  
  For deployment details, see the **[GLM-V](https://github.com/zai-org/GLM-V)** repository.

### Citation

If you find our work helpful, please cite the following paper:
```bibtex
@article{liu2024autoglm,
  title={Autoglm: Autonomous foundation agents for guis},
  author={Liu, Xiao and Qin, Bo and Liang, Dongzhu and Dong, Guang and Lai, Hanyu and Zhang, Hanchen and Zhao, Hanlin and Iong, Iat Long and Sun, Jiadai and Wang, Jiaqi and others},
  journal={arXiv preprint arXiv:2411.00820},
  year={2024}
}
@article{xu2025mobilerl,
  title={MobileRL: Online Agentic Reinforcement Learning for Mobile GUI Agents},
  author={Xu, Yifan and Liu, Xiao and Liu, Xinghan and Fu, Jiaqi and Zhang, Hanchen and Jing, Bohao and Zhang, Shudan and Wang, Yuting and Zhao, Wenyi and Dong, Yuxiao},
  journal={arXiv preprint arXiv:2509.18119},
  year={2025}
}
```