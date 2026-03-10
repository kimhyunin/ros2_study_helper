# CLI 도구 모음

> ROS2 Humble에서 자주 활용하는 CLI 도구와 유틸리티 정리.

## rqt 도구 모음

```bash
# rqt 메인 GUI (모든 플러그인 포함)
rqt

# 노드 연결 그래프
rqt_graph

# 토픽 실시간 플롯
rqt_plot /turtle1/pose/x /turtle1/pose/y

# 로그 메시지 뷰어
rqt_console

# 파라미터 동적 변경
rqt_reconfigure

# 서비스 호출 GUI
rqt_service_caller

# 토픽 발행 GUI
rqt_publisher

# 이미지 뷰어
rqt_image_view

# 액션 타이프 뷰어
rqt_action

# 백 파일 재생
rqt_bag
```

## RViz2

```bash
# RViz2 기본 실행
rviz2

# 설정 파일로 실행
rviz2 -d ~/my_config.rviz

# 특정 Fixed Frame 지정
rviz2 --fixed-frame map

# RViz2 디스플레이 타입 (패널에서 Add 버튼으로 추가)
# - RobotModel: URDF 기반 로봇 모델 표시
# - TF: 좌표 프레임 표시
# - LaserScan: LiDAR 데이터
# - PointCloud2: 3D 포인트 클라우드
# - Marker/MarkerArray: 커스텀 마커
# - Path: 경로 표시
# - Odometry: 주행 기록계 표시
# - Image: 카메라 이미지
# - Map: 2D 지도
# - Costmap: 비용 지도
```

## TF2 도구

```bash
# TF 트리를 PDF로 저장
ros2 run tf2_tools view_frames
# -> frames.pdf 생성됨

# 두 프레임 간 변환 실시간 출력
ros2 run tf2_ros tf2_echo world base_link
ros2 run tf2_ros tf2_echo map odom

# TF 정적 변환 발행 (x y z qx qy qz qw)
ros2 run tf2_ros static_transform_publisher \
  0.1 0.0 0.2 0.0 0.0 0.0 1.0 base_link camera_link

# TF 정적 변환 (roll pitch yaw 사용)
ros2 run tf2_ros static_transform_publisher \
  --x 0.1 --y 0.0 --z 0.2 \
  --roll 0.0 --pitch 0.0 --yaw 0.0 \
  --frame-id base_link --child-frame-id lidar_link
```

## ros2 doctor

```bash
# 시스템 상태 진단
ros2 doctor

# 상세 진단
ros2 doctor --report

# 특정 검사만 실행
ros2 doctor --include-warnings
```

## ros2 wtf (별칭)

```bash
# ros2 doctor의 별칭
ros2 wtf
ros2 wtf --report
```

## ros2 lifecycle

```bash
# Lifecycle Node 상태 목록
ros2 lifecycle list /managed_node

# Lifecycle Node 상태 가져오기
ros2 lifecycle get /managed_node

# 상태 전환 (configure, activate, deactivate, cleanup, shutdown)
ros2 lifecycle set /managed_node configure
ros2 lifecycle set /managed_node activate
ros2 lifecycle set /managed_node deactivate
ros2 lifecycle set /managed_node cleanup
ros2 lifecycle set /managed_node shutdown
```

## ros2 component

```bash
# 컴포넌트 컨테이너 실행
ros2 run rclcpp_components component_container

# 컴포넌트 로드
ros2 component load /ComponentManager <package> <plugin>

# 로드된 컴포넌트 목록
ros2 component list

# 컴포넌트 언로드
ros2 component unload /ComponentManager <component_id>

# 독립 컨테이너에서 컴포넌트 실행
ros2 component standalone <package> <plugin>
```

## URDF / XACRO 도구

```bash
# XACRO 파일을 URDF로 변환
ros2 run xacro xacro robot.urdf.xacro > robot.urdf

# URDF 검증
check_urdf robot.urdf

# URDF 트리 출력 (urdf_parser_plugin 필요)
urdf_to_graphiz robot.urdf

# URDF 표시 (RViz2 사용)
ros2 launch urdf_launch display.launch.py urdf_package:=my_robot \
  urdf_package_path:=urdf/robot.urdf.xacro
```

## Gazebo 관련 (Classic / Ignition)

```bash
# Gazebo Classic 실행
gazebo

# Gazebo Ignition (Fortress - Humble 기본)
ign gazebo empty.sdf

# ROS2-Gazebo 브리지 (토픽)
ros2 run ros_gz_bridge parameter_bridge \
  /clock@rosgraph_msgs/msg/Clock[ignition.msgs.Clock

# 여러 토픽 브리지
ros2 run ros_gz_bridge parameter_bridge \
  /cmd_vel@geometry_msgs/msg/Twist]ignition.msgs.Twist \
  /odom@nav_msgs/msg/Odometry[ignition.msgs.Odometry
```

## 네트워크 및 DDS 관련

```bash
# ROS2 노드 검색 (멀티캐스트 확인)
ros2 node list

# DDS 구현 확인
echo $RMW_IMPLEMENTATION

# CycloneDDS 설정 파일 지정
export CYCLONEDDS_URI=file:///path/to/cyclone_config.xml

# FastDDS 설정
export FASTRTPS_DEFAULT_PROFILES_FILE=/path/to/fastdds_config.xml

# 도메인 ID 설정 (0-232)
export ROS_DOMAIN_ID=0

# 같은 머신에서만 통신
export ROS_LOCALHOST_ONLY=1
```

## 성능 측정 도구

```bash
# 메시지 레이턴시 측정
ros2 run performance_test perf_test \
  --communication ROS2 \
  --msg Array1k \
  --rate 100 \
  --num-pub-threads 1 \
  --num-sub-threads 1 \
  --roundtrip-mode Main \
  --runtime 30

# 토픽 Hz 측정
ros2 topic hz /my_topic

# 토픽 대역폭
ros2 topic bw /my_topic

# 딜레이 측정 (메시지에 헤더 있어야 함)
ros2 topic delay /my_topic
```

## colcon 고급 사용

```bash
# 빌드 결과 확인
colcon list
colcon list --topological-order

# 의존성 그래프 출력
colcon graph

# 테스트 커버리지
colcon test --packages-select my_package
colcon test-result

# 특정 테스트만 실행
colcon test --packages-select my_package \
  --pytest-args -k test_my_function

# CMake 캐시 클리어 후 빌드
rm -rf build/ install/ log/
colcon build --symlink-install
```

## 패키지 관리

```bash
# apt로 ROS2 패키지 검색
apt search ros-humble

# 패키지 설치
sudo apt install ros-humble-<package-name>

# 예시: nav2 설치
sudo apt install ros-humble-navigation2
sudo apt install ros-humble-nav2-bringup

# 예시: MoveIt2 설치
sudo apt install ros-humble-moveit

# pip으로 Python 의존성 설치
pip install <package>

# 의존성 전체 설치
rosdep install --from-paths src --ignore-src -r -y
```
