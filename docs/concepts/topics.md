# ROS2 Topic
![topic_image](https://docs.ros.org/en/humble/_images/Topic-SinglePublisherandSingleSubscriber.gif)

![topic_multi_image](https://docs.ros.org/en/humble/_images/Topic-MultiplePublisherandMultipleSubscriber.gif)
## Topic이란?

Topic은 ROS2에서 **비동기 단방향 통신** 방식입니다. **발행자(Publisher)**가 메시지를 토픽에 발행하면, 해당 토픽을 구독하는 **구독자(Subscriber)** 모두가 메시지를 받습니다.

```
[Publisher Node] --메시지--> /topic_name --메시지--> [Subscriber Node A]
                                         --메시지--> [Subscriber Node B]
```

### 특징
- **비동기**: 발행자와 구독자가 직접 연결되지 않음
- **1:N 통신**: 하나의 토픽에 여러 구독자 가능
- **N:1 통신**: 여러 발행자가 하나의 토픽에 발행 가능
- 실시간 센서 데이터, 상태 정보 전송에 적합

---

## 🐢 Turtlesim으로 배우는 Topic

### 준비

```bash
# 터미널 1
ros2 run turtlesim turtlesim_node

# 터미널 2
ros2 run turtlesim turtle_teleop_key

# 터미널 3 — 여기서 실습
```

### rqt_graph — 노드-토픽 관계 시각화

```bash
rqt_graph
```

`/teleop_turtle` 노드가 `/turtle1/cmd_vel` 토픽으로 메시지를 발행하고, `/turtlesim` 노드가 이를 구독하는 흐름을 볼 수 있습니다.

### 토픽 목록 확인

```bash
ros2 topic list -t
```

```
/parameter_events [rcl_interfaces/msg/ParameterEvent]
/rosout [rcl_interfaces/msg/Log]
/turtle1/cmd_vel [geometry_msgs/msg/Twist]      # 속도 명령
/turtle1/color_sensor [turtlesim/msg/Color]     # 펜 색상
/turtle1/pose [turtlesim/msg/Pose]              # 거북이 위치
```

### 메시지 실시간 확인

```bash
# teleop 터미널에서 방향키를 누르면서 확인
ros2 topic echo /turtle1/cmd_vel
```

```yaml
linear:
  x: 2.0
  y: 0.0
  z: 0.0
angular:
  x: 0.0
  y: 0.0
  z: 0.0
```

### 메시지 구조 확인

```bash
ros2 interface show geometry_msgs/msg/Twist
```

```
# This expresses velocity in free space broken into its linear and angular parts.
Vector3  linear
    float64 x
    float64 y
    float64 z
Vector3  angular
    float64 x
    float64 y
    float64 z
```

### 토픽 정보 확인

```bash
ros2 topic info /turtle1/cmd_vel
```

```
Type: geometry_msgs/msg/Twist
Publisher count: 1
Subscription count: 1
```

### CLI에서 직접 토픽 발행 — 거북이 움직이기

```bash
# 거북이를 원으로 움직이기 (1Hz로 계속 발행)
ros2 topic pub /turtle1/cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 1.8}}"

# 한 번만 발행
ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 1.8}}"
```

### 발행 주기 및 대역폭 확인

```bash
# /turtle1/pose 발행 주기 확인
ros2 topic hz /turtle1/pose
# average rate: 62.5 Hz

# 대역폭 확인
ros2 topic bw /turtle1/cmd_vel

# 특정 메시지 타입의 토픽 찾기
ros2 topic find geometry_msgs/msg/Twist
```

---

## Publisher 예시 (Python)

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class StringPublisher(Node):
    def __init__(self):
        super().__init__('string_publisher')
        # 토픽 이름, 메시지 타입, QoS 큐 크기
        self.publisher_ = self.create_publisher(String, 'my_topic', 10)
        # 0.5초마다 발행
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.count = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello ROS2! count: {self.count}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'발행: {msg.data}')
        self.count += 1

def main(args=None):
    rclpy.init(args=args)
    node = StringPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

## Subscriber 예시 (Python)

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class StringSubscriber(Node):
    def __init__(self):
        super().__init__('string_subscriber')
        # 토픽 이름, 메시지 타입, 콜백, QoS
        self.subscription = self.create_subscription(
            String,
            'my_topic',
            self.listener_callback,
            10
        )

    def listener_callback(self, msg):
        self.get_logger().info(f'수신: {msg.data}')

def main(args=None):
    rclpy.init(args=args)
    node = StringSubscriber()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

## QoS (Quality of Service) 설정

QoS는 메시지 전송 품질을 제어합니다. 발행자와 구독자의 QoS 프로파일이 **호환 가능**해야 통신됩니다.

### 주요 QoS 설정

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy, HistoryPolicy

# 기본 QoS (큐 크기 10)
qos = QoSProfile(depth=10)

# 신뢰성 있는 전송 (TCP처럼 재전송 보장)
qos_reliable = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    depth=10
)

# 빠른 전송 우선 (센서 데이터에 적합)
qos_best_effort = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    depth=10
)

# 지속성 있는 QoS (새 구독자가 이전 메시지 받을 수 있음)
qos_transient = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    durability=DurabilityPolicy.TRANSIENT_LOCAL,
    depth=1
)
```

### 사전 정의된 QoS 프로파일

```python
from rclpy.qos import qos_profile_sensor_data
from rclpy.qos import qos_profile_system_default
from rclpy.qos import QoSPresetProfiles

# 센서 데이터용 (BEST_EFFORT, VOLATILE, KEEP_LAST 5)
self.create_subscription(LaserScan, '/scan', self.cb, qos_profile_sensor_data)

# 시스템 기본값
self.create_publisher(String, '/topic', qos_profile_system_default)

# 미리 정의된 프로파일 사용
qos = QoSPresetProfiles.SENSOR_DATA.value
qos = QoSPresetProfiles.SYSTEM_DEFAULT.value
qos = QoSPresetProfiles.SERVICES_DEFAULT.value
```

### QoS 호환성 규칙

| Publisher | Subscriber | 결과 |
|-----------|------------|------|
| RELIABLE | RELIABLE | 호환 O |
| RELIABLE | BEST_EFFORT | 호환 O |
| BEST_EFFORT | RELIABLE | 호환 X |
| BEST_EFFORT | BEST_EFFORT | 호환 O |

## 자주 쓰는 메시지 타입

### std_msgs

```python
from std_msgs.msg import String    # 문자열
from std_msgs.msg import Int32     # 32비트 정수
from std_msgs.msg import Float64   # 64비트 실수
from std_msgs.msg import Bool      # 불리언
from std_msgs.msg import Header    # 타임스탬프 + 프레임 ID
from std_msgs.msg import Float32MultiArray  # 배열

# Header 포함 메시지에서 타임스탬프 사용
from std_msgs.msg import Header
from builtin_interfaces.msg import Time

msg = Header()
msg.stamp = self.get_clock().now().to_msg()
msg.frame_id = 'base_link'
```

### geometry_msgs

```python
from geometry_msgs.msg import Twist      # 선속도 + 각속도 (cmd_vel)
from geometry_msgs.msg import Pose       # 위치 + 자세
from geometry_msgs.msg import PoseStamped  # Header + Pose
from geometry_msgs.msg import Point      # x, y, z
from geometry_msgs.msg import Quaternion # 쿼터니언
from geometry_msgs.msg import Transform  # 변환
from geometry_msgs.msg import TransformStamped  # Header + Transform

# Twist 메시지 예시
cmd_vel = Twist()
cmd_vel.linear.x = 0.5   # 전진 속도 (m/s)
cmd_vel.angular.z = 0.3  # 회전 속도 (rad/s)
```

### sensor_msgs

```python
from sensor_msgs.msg import LaserScan    # LiDAR 스캔 데이터
from sensor_msgs.msg import Image        # 카메라 이미지
from sensor_msgs.msg import PointCloud2  # 3D 포인트 클라우드
from sensor_msgs.msg import Imu          # IMU 데이터
from sensor_msgs.msg import NavSatFix    # GPS 데이터
from sensor_msgs.msg import JointState   # 관절 상태
from sensor_msgs.msg import BatteryState # 배터리 상태
```

### nav_msgs

```python
from nav_msgs.msg import Odometry    # 주행 기록계
from nav_msgs.msg import OccupancyGrid  # 2D 점유 격자 지도
from nav_msgs.msg import Path        # 경로
```

## CLI로 토픽 디버깅

```bash
# 토픽 목록 (타입 포함)
ros2 topic list -t

# 토픽 메시지 실시간 출력
ros2 topic echo /cmd_vel

# 토픽 발행 Hz
ros2 topic hz /scan

# 토픽 상세 정보 (QoS 포함)
ros2 topic info /scan -v

# 커맨드라인에서 토픽 발행
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist \
  '{linear: {x: 0.5}, angular: {z: 0.3}}'
```

## 실용 팁

::: tip 토픽 이름 규칙
- 절대 경로: `/camera/image_raw`
- 상대 경로: `image_raw` (노드 네임스페이스 기준으로 해석)
- 리매핑: `ros2 run pkg node --ros-args -r old_topic:=new_topic`
:::

::: warning QoS 불일치
센서 데이터는 보통 `BEST_EFFORT`를 사용합니다. 구독자가 `RELIABLE`로 설정하면 통신이 안 됩니다. `ros2 topic info -v`로 양쪽 QoS를 확인하세요.
:::
