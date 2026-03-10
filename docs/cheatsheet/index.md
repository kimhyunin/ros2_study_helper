# ROS2 Humble 명령어 치트시트

> 자주 사용하는 ROS2 CLI 명령어 모음. 터미널에서 바로 복사해서 사용하세요.

## 환경 설정

```bash
# ROS2 환경 소싱 (매 터미널마다 또는 ~/.bashrc에 추가)
source /opt/ros/humble/setup.bash

# 워크스페이스 빌드 후 환경 소싱
source ~/ros2_ws/install/setup.bash

# 현재 ROS2 버전 확인
printenv ROS_DISTRO
# 출력: humble
```

## ros2 run / launch

```bash
# 패키지의 실행 파일 실행
ros2 run <package_name> <executable_name>
ros2 run turtlesim turtlesim_node

# 노드 이름 변경하여 실행
ros2 run turtlesim turtlesim_node --ros-args -r __node:=my_turtle

# 토픽 리매핑하여 실행
ros2 run turtlesim turtle_teleop_key --ros-args -r /turtle1/cmd_vel:=/my_cmd_vel

# 파라미터 지정하여 실행
ros2 run my_pkg my_node --ros-args -p param_name:=value

# Launch 파일 실행
ros2 launch <package_name> <launch_file.py>
ros2 launch nav2_bringup navigation_launch.py

# Launch 파일에 인수 전달
ros2 launch my_pkg my_launch.py use_sim_time:=true map:=/path/to/map.yaml
```

## ros2 node

```bash
# 실행 중인 노드 목록
ros2 node list

# 노드 상세 정보 (발행/구독 토픽, 서비스, 액션 포함)
ros2 node info /node_name
ros2 node info /turtlesim

# 노드 그래프 시각화 (rqt_graph 실행)
rqt_graph
```

## ros2 topic

```bash
# 활성 토픽 목록
ros2 topic list

# 토픽 목록 (메시지 타입 포함)
ros2 topic list -t

# 토픽 메시지 출력 (실시간)
ros2 topic echo /topic_name
ros2 topic echo /turtle1/pose

# 특정 횟수만 출력
ros2 topic echo /topic_name --once
ros2 topic echo /topic_name -n 5

# 토픽 메시지 타입 확인
ros2 topic type /topic_name

# 토픽 발행 Hz 확인
ros2 topic hz /topic_name

# 토픽 대역폭 확인
ros2 topic bw /topic_name

# 토픽 상세 정보 (발행자/구독자 수 등)
ros2 topic info /topic_name
ros2 topic info /topic_name -v  # 상세 정보 (QoS 포함)

# 토픽으로 메시지 발행 (한 번)
ros2 topic pub --once /topic_name <msg_type> '<yaml_data>'
ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist \
  '{linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 1.8}}'

# 토픽으로 메시지 발행 (반복)
ros2 topic pub --rate 1 /topic_name <msg_type> '<yaml_data>'

# 토픽 딜레이 측정
ros2 topic delay /topic_name
```

## ros2 service

```bash
# 활성 서비스 목록
ros2 service list

# 서비스 목록 (타입 포함)
ros2 service list -t

# 서비스 타입 확인
ros2 service type /service_name
ros2 service type /clear

# 특정 타입의 서비스 찾기
ros2 service find std_srvs/srv/Empty

# 서비스 호출
ros2 service call /service_name <srv_type> '<yaml_data>'
ros2 service call /clear std_srvs/srv/Empty

# 서비스 호출 예시 (데이터 포함)
ros2 service call /spawn turtlesim/srv/Spawn \
  '{x: 2, y: 2, theta: 0.2, name: "turtle2"}'

# 서비스 인터페이스 확인
ros2 interface show turtlesim/srv/Spawn
```

## ros2 action

```bash
# 활성 액션 목록
ros2 action list

# 액션 목록 (타입 포함)
ros2 action list -t

# 액션 상세 정보
ros2 action info /action_name
ros2 action info /turtle1/rotate_absolute

# 액션 Goal 전송
ros2 action send_goal /action_name <action_type> '<yaml_goal>'
ros2 action send_goal /turtle1/rotate_absolute \
  turtlesim/action/RotateAbsolute '{theta: 1.57}'

# Goal 전송 및 피드백 출력
ros2 action send_goal --feedback /turtle1/rotate_absolute \
  turtlesim/action/RotateAbsolute '{theta: 1.57}'

# 액션 인터페이스 확인
ros2 interface show turtlesim/action/RotateAbsolute
```

## ros2 param

```bash
# 특정 노드의 파라미터 목록
ros2 param list
ros2 param list /node_name

# 파라미터 값 읽기
ros2 param get /node_name param_name
ros2 param get /turtlesim background_r

# 파라미터 값 변경
ros2 param set /node_name param_name value
ros2 param set /turtlesim background_r 150

# 파라미터 덤프 (YAML 파일로 저장)
ros2 param dump /node_name
ros2 param dump /turtlesim > turtlesim_params.yaml

# 파라미터 파일 로드
ros2 param load /node_name params.yaml
ros2 param load /turtlesim turtlesim_params.yaml

# 파라미터 설명 확인
ros2 param describe /node_name param_name
```

## ros2 bag

```bash
# 모든 토픽 녹화
ros2 bag record -a

# 특정 토픽만 녹화
ros2 bag record /topic1 /topic2

# 특정 파일명으로 녹화
ros2 bag record -o my_bag /topic1 /topic2

# Bag 파일 재생
ros2 bag play my_bag

# 재생 속도 조절 (2배속)
ros2 bag play my_bag --rate 2.0

# 특정 시간부터 재생
ros2 bag play my_bag --start-offset 10.0

# Bag 파일 정보 확인
ros2 bag info my_bag

# 재생 시 토픽 리매핑
ros2 bag play my_bag --remap /old_topic:=/new_topic
```

## ros2 pkg

```bash
# 새 패키지 생성 (Python)
ros2 pkg create --build-type ament_python <package_name>
ros2 pkg create --build-type ament_python my_py_pkg --dependencies rclpy std_msgs

# 새 패키지 생성 (C++)
ros2 pkg create --build-type ament_cmake <package_name>
ros2 pkg create --build-type ament_cmake my_cpp_pkg --dependencies rclcpp std_msgs

# 설치된 패키지 목록
ros2 pkg list

# 특정 패키지 경로 확인
ros2 pkg prefix <package_name>
ros2 pkg prefix turtlesim

# 패키지 실행 파일 목록
ros2 pkg executables <package_name>
ros2 pkg executables turtlesim
```

## ros2 interface

```bash
# 메시지/서비스/액션 인터페이스 내용 확인
ros2 interface show std_msgs/msg/String
ros2 interface show geometry_msgs/msg/Twist
ros2 interface show std_srvs/srv/SetBool
ros2 interface show nav2_msgs/action/NavigateToPose

# 모든 인터페이스 목록
ros2 interface list

# 메시지만 목록
ros2 interface list --only-msgs

# 서비스만 목록
ros2 interface list --only-srvs

# 액션만 목록
ros2 interface list --only-actions

# 패키지의 인터페이스 목록
ros2 interface package std_msgs
ros2 interface package geometry_msgs
```

## colcon 빌드

```bash
# 기본 빌드
colcon build

# 심볼릭 링크 사용 (Python 파일 수정 시 재빌드 불필요)
colcon build --symlink-install

# 특정 패키지만 빌드
colcon build --packages-select my_package

# 특정 패키지와 의존성 함께 빌드
colcon build --packages-up-to my_package

# 빌드에서 특정 패키지 제외
colcon build --packages-ignore my_package

# 병렬 빌드 수 제한 (메모리 부족 시)
colcon build --executor sequential

# 빌드 로그 출력
colcon build --event-handlers console_direct+

# CMake 인수 전달
colcon build --cmake-args -DCMAKE_BUILD_TYPE=Release

# 테스트 실행
colcon test
colcon test --packages-select my_package

# 테스트 결과 확인
colcon test-result --verbose
```

## rosdep

```bash
# rosdep 초기화 (최초 1회)
sudo rosdep init
rosdep update

# 현재 워크스페이스의 의존성 설치
rosdep install --from-paths src --ignore-src -r -y

# 특정 패키지 의존성 설치
rosdep install <package_name>

# 의존성 확인 (설치 없이)
rosdep check --from-paths src --ignore-src
```

## 환경 변수

```bash
# ROS2 주요 환경 변수 확인
printenv | grep ROS

# ROS_DOMAIN_ID 설정 (다중 로봇/컴퓨터 격리)
export ROS_DOMAIN_ID=42

# localhost만 통신 (단일 컴퓨터)
export ROS_LOCALHOST_ONLY=1

# DDS 구현 변경 (기본: fastrtps)
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
export RMW_IMPLEMENTATION=rmw_fastrtps_cpp

# 로그 레벨 설정
export RCUTILS_LOGGING_SEVERITY_THRESHOLD=DEBUG
```

## 유용한 도구

```bash
# Node 그래프 시각화
rqt_graph

# 토픽 플로터
rqt_plot

# 로그 뷰어
rqt_console

# 파라미터 GUI
rqt_reconfigure

# RViz2 실행
rviz2

# RViz2 설정 파일로 실행
rviz2 -d /path/to/config.rviz

# TF 트리 시각화
ros2 run tf2_tools view_frames

# TF 변환 값 확인
ros2 run tf2_ros tf2_echo <parent_frame> <child_frame>
ros2 run tf2_ros tf2_echo map base_link
```
