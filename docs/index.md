---
layout: home

hero:
  name: "ROS2 Humble"
  text: "학습 도우미"
  tagline: "나만의 ROS2 학습 노트 & 레퍼런스 — 명령어, 개념, 코드 스니펫을 한 곳에서"
  image:
    src: /robot.svg
    alt: ROS2 Robot
  actions:
    - theme: brand
      text: 치트시트 보기
      link: /cheatsheet/
    - theme: alt
      text: 핵심 개념
      link: /concepts/nodes
    - theme: alt
      text: 체크리스트
      link: /checklist/

features:
  - icon: 📋
    title: 치트시트
    details: ros2 run, topic, service, action, param, bag 등 자주 쓰는 CLI 명령어를 한눈에 확인하세요. colcon 빌드 옵션과 rosdep 사용법도 포함되어 있습니다.
    link: /cheatsheet/
    linkText: 명령어 보기

  - icon: 🧠
    title: 핵심 개념
    details: Node, Topic, Service, Action, TF2, Parameters, Launch 파일까지 ROS2의 핵심 개념을 예제 코드와 함께 정리했습니다.
    link: /concepts/nodes
    linkText: 개념 학습

  - icon: 📦
    title: 패키지 & 템플릿
    details: C++/Python 패키지 구조, CMakeLists.txt, package.xml, setup.py, Launch 파일 템플릿을 복사해서 바로 사용하세요.
    link: /templates/package-structure
    linkText: 템플릿 보기

  - icon: 💻
    title: 코드 스니펫
    details: Publisher, Subscriber, Service, Action, TF2 등 rclpy 기반 완전한 코드 스니펫 모음. 복사해서 바로 사용 가능합니다.
    link: /snippets/
    linkText: 스니펫 보기

  - icon: ✅
    title: 학습 체크리스트
    details: 환경 설정부터 Navigation2, MoveIt2, Gazebo까지 ROS2 Humble 학습 로드맵을 체크리스트로 확인하세요.
    link: /checklist/
    linkText: 체크리스트 보기

  - icon: 🔧
    title: TF2 & 좌표 변환
    details: 좌표 프레임 변환, tf2_echo, view_frames, lookup_transform, broadcast 등 TF2 사용법을 정리했습니다.
    link: /concepts/tf2
    linkText: TF2 보기
---

## 빠른 시작

ROS2 Humble을 처음 시작한다면 아래 순서로 학습하세요.

```bash
# 1. ROS2 Humble 환경 소싱
source /opt/ros/humble/setup.bash

# 2. 워크스페이스 생성
mkdir -p ~/ros2_ws/src && cd ~/ros2_ws

# 3. 패키지 생성 (Python)
ros2 pkg create --build-type ament_python my_package --dependencies rclpy std_msgs

# 4. 빌드
colcon build --symlink-install

# 5. 환경 소싱
source install/setup.bash
```

## 자주 쓰는 명령어 (Quick Reference)

| 명령어 | 설명 |
|--------|------|
| `ros2 node list` | 실행 중인 노드 목록 |
| `ros2 topic list` | 활성 토픽 목록 |
| `ros2 topic echo /topic_name` | 토픽 메시지 출력 |
| `ros2 service list` | 활성 서비스 목록 |
| `ros2 param list` | 파라미터 목록 |
| `colcon build --symlink-install` | 심볼릭 링크로 빌드 |
| `ros2 bag record -a` | 모든 토픽 녹화 |

> **Tip:** 매번 `source /opt/ros/humble/setup.bash`를 입력하기 귀찮다면 `~/.bashrc`에 추가하세요.
