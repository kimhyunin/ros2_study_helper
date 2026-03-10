# ROS2 Humble 학습 체크리스트

> 진도를 확인하며 학습하세요. 완료한 항목은 체크박스를 눌러 체크하세요.

## 1단계: 환경 설정

### ROS2 Humble 설치
- [ ] Ubuntu 22.04 (Jammy) 설치 확인
- [ ] ROS2 Humble Hawksbill 공식 설치 완료
- [ ] `source /opt/ros/humble/setup.bash` 확인
- [ ] `.bashrc`에 자동 소싱 추가
- [ ] `ros2 run demo_nodes_cpp talker` 실행 확인
- [ ] `colcon` 설치 확인 (`sudo apt install python3-colcon-common-extensions`)
- [ ] `rosdep` 초기화 완료 (`sudo rosdep init && rosdep update`)

### 워크스페이스 설정
- [ ] `~/ros2_ws/src` 디렉토리 생성
- [ ] 첫 번째 `colcon build` 성공
- [ ] `source ~/ros2_ws/install/setup.bash` 확인
- [ ] `.bashrc`에 워크스페이스 소싱 추가

### 개발 환경
- [ ] VS Code + Python 확장 설치
- [ ] VS Code ROS 확장 설치 (선택)
- [ ] `rqt` 도구 실행 확인
- [ ] `rviz2` 실행 확인

---

## 2단계: 기초 개념

### CLI 기본 명령어
- [ ] `ros2 node list` 사용법 이해
- [ ] `ros2 topic list -t` 사용법 이해
- [ ] `ros2 topic echo /topic` 사용법 이해
- [ ] `ros2 service list -t` 사용법 이해
- [ ] `ros2 action list -t` 사용법 이해
- [ ] `ros2 param list` / `get` / `set` 사용법 이해
- [ ] `ros2 interface show` 사용법 이해
- [ ] `rqt_graph`로 노드 연결 시각화

### 패키지 구조 이해
- [ ] Python 패키지 (`ament_python`) 구조 이해
- [ ] C++ 패키지 (`ament_cmake`) 구조 이해
- [ ] `package.xml` 의존성 선언 방법 이해
- [ ] `setup.py` `entry_points` 설정 이해
- [ ] `CMakeLists.txt` 기본 구조 이해
- [ ] Launch 파일 디렉토리 등록 방법 이해

---

## 3단계: 통신 방법

### Node
- [ ] `rclpy.node.Node` 상속하여 커스텀 노드 작성
- [ ] `get_logger()` 로깅 사용
- [ ] `create_timer()` 타이머 콜백 사용
- [ ] `rclpy.spin()` vs `spin_once()` 차이 이해
- [ ] Lifecycle Node 개념 이해 (선택)

### Topic
- [ ] Publisher 노드 작성 및 실행
- [ ] Subscriber 노드 작성 및 실행
- [ ] `std_msgs` 메시지 타입 사용
- [ ] `geometry_msgs/Twist` 발행 (cmd_vel)
- [ ] `sensor_msgs/LaserScan` 구독
- [ ] QoS 설정 이해 (Reliability, Durability)
- [ ] `qos_profile_sensor_data` 사용

### Service
- [ ] Service Server 작성 및 실행
- [ ] Service Client 작성 (동기 방식)
- [ ] Service Client 작성 (비동기 방식 with callback)
- [ ] `std_srvs/SetBool`, `std_srvs/Trigger` 사용
- [ ] 커스텀 `.srv` 파일 생성

### Action
- [ ] Action Server 작성 (Goal/Feedback/Result)
- [ ] Action Client 작성 (Goal 전송 + 피드백 수신)
- [ ] Goal 취소 구현
- [ ] `action_tutorials_interfaces/Fibonacci` 예제 실행
- [ ] 커스텀 `.action` 파일 생성

### Parameters
- [ ] `declare_parameter()` 사용
- [ ] `get_parameter().value` 읽기
- [ ] YAML 파라미터 파일 작성
- [ ] Launch 파일에서 파라미터 파일 로드
- [ ] `add_on_set_parameters_callback()` 동적 변경 처리
- [ ] CLI로 런타임 파라미터 변경

---

## 4단계: 실제 구현

### Launch 파일
- [ ] 기본 Python Launch 파일 작성
- [ ] `DeclareLaunchArgument` 인수 추가
- [ ] `IncludeLaunchDescription`으로 외부 Launch 포함
- [ ] `FindPackageShare`로 패키지 경로 찾기
- [ ] Namespace 적용 (`PushRosNamespace`)
- [ ] 조건부 실행 (`OpaqueFunction`)

### TF2
- [ ] `tf2_echo`로 변환 확인
- [ ] `view_frames`로 TF 트리 시각화
- [ ] Static Transform Broadcaster 사용
- [ ] Dynamic Transform Broadcaster 작성
- [ ] TF Listener로 변환 조회
- [ ] `TransformException` 예외 처리
- [ ] Euler <-> Quaternion 변환 이해

### rosbag2
- [ ] `ros2 bag record -a` 녹화
- [ ] `ros2 bag play` 재생
- [ ] 특정 토픽만 녹화
- [ ] 재생 속도 조절
- [ ] `ros2 bag info`로 bag 정보 확인

### RViz2
- [ ] `robot_state_publisher`와 URDF 시각화
- [ ] `TF` 디스플레이 추가
- [ ] `LaserScan` 시각화
- [ ] `Marker`/`MarkerArray` 직접 발행하여 시각화
- [ ] `.rviz` 설정 파일 저장 및 로드

---

## 5단계: 고급 개념

### Robot State Publisher & URDF
- [ ] URDF 파일 기본 구조 이해
- [ ] XACRO 매크로 사용법 이해
- [ ] `robot_state_publisher` 노드 실행
- [ ] `joint_state_publisher_gui`로 조인트 값 시각화
- [ ] Inertia, Collision, Visual 속성 설정

### Navigation2 (Nav2)
- [ ] Nav2 스택 설치 (`ros-humble-navigation2`)
- [ ] `slam_toolbox`로 지도 작성 (SLAM)
- [ ] 작성된 지도 저장 (`map_saver_cli`)
- [ ] Nav2 `map_server`로 저장된 지도 로드
- [ ] `amcl`로 자기 위치 추정 (Localization)
- [ ] RViz2에서 `2D Goal Pose`로 목적지 설정
- [ ] Nav2 파라미터 파일 수정
- [ ] 커스텀 `BehaviorTree` 작성 (선택)

### Gazebo / 시뮬레이션
- [ ] Gazebo Ignition (Fortress) 설치 및 실행
- [ ] `ros_gz_bridge`로 ROS2 <-> Gazebo 토픽 브리지
- [ ] SDF 파일로 간단한 로봇 모델 작성
- [ ] URDF를 Gazebo에서 스폰
- [ ] `use_sim_time:=true` 설정
- [ ] TurtleBot3 시뮬레이션 실행 (선택)

### MoveIt2 (로봇 팔)
- [ ] MoveIt2 설치 (`ros-humble-moveit`)
- [ ] `MoveGroupInterface` 사용
- [ ] 관절 공간 계획 (Joint Space Planning)
- [ ] 작업 공간 계획 (Cartesian Space Planning)
- [ ] 충돌 물체 추가 (`planning_scene_interface`)
- [ ] `MoveItPy` (Python) 사용 (선택)

### 멀티 로봇 / 고급 패턴
- [ ] `ROS_DOMAIN_ID`로 통신 격리
- [ ] Namespace로 여러 로봇 실행
- [ ] `MultiThreadedExecutor` 사용
- [ ] `ReentrantCallbackGroup` 이해
- [ ] Composition으로 노드 최적화
- [ ] 커스텀 메시지/서비스/액션 인터페이스 패키지 생성
- [ ] `lifecycle_manager` 사용
- [ ] DDS QoS 튜닝 (네트워크 환경에 맞게)

### 테스트
- [ ] `pytest`로 Python 유닛 테스트 작성
- [ ] `colcon test` 실행
- [ ] Launch 테스트 작성 (`launch_testing`)
- [ ] CI/CD 파이프라인 구성 (GitHub Actions)

---

## 참고 리소스

| 리소스 | 링크 |
|--------|------|
| ROS2 공식 문서 | https://docs.ros.org/en/humble/ |
| ROS2 튜토리얼 | https://docs.ros.org/en/humble/Tutorials.html |
| Nav2 문서 | https://navigation.ros.org/ |
| MoveIt2 문서 | https://moveit.picknik.ai/ |
| ROS2 Discourse | https://discourse.ros.org/ |
| ROS Answers | https://answers.ros.org/ |
| GitHub: ros2/demos | https://github.com/ros2/demos |

> **Tip:** 체크리스트를 순서대로 따라가지 않아도 됩니다. 현재 프로젝트에 필요한 항목부터 학습하세요!
