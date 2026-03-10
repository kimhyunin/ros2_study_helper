# TF2 (Transform Library 2)

## TF2란?

TF2는 ROS2에서 **좌표 프레임(Coordinate Frame) 간의 변환**을 관리하는 라이브러리입니다. 로봇의 각 부위(base_link, camera_link, lidar_link 등)와 환경 프레임(map, odom, world) 간의 상대적 위치/자세 관계를 시간에 따라 추적합니다.

```
world
  └── map
        └── odom
              └── base_link
                    ├── camera_link
                    ├── lidar_link
                    └── arm_base
                          └── arm_end_effector
```

### 주요 개념

| 용어 | 설명 |
|------|------|
| **Frame** | 좌표계 (예: `map`, `base_link`, `camera_link`) |
| **Transform** | 두 프레임 간의 변환 (평행이동 + 회전) |
| **Broadcaster** | 변환 정보를 발행하는 노드 |
| **Listener** | 변환 정보를 수신하고 조회하는 노드 |
| **Buffer** | 변환 이력을 저장하는 버퍼 (기본 10초) |

## 자주 쓰는 프레임

| 프레임 이름 | 설명 |
|------------|------|
| `map` | 고정된 글로벌 좌표계 |
| `odom` | 주행 기록계 기준 좌표계 (드리프트 있음) |
| `base_link` | 로봇 본체 기준 좌표계 |
| `base_footprint` | 로봇 발바닥 기준 좌표계 |
| `camera_link` | 카메라 좌표계 |
| `lidar_link` | LiDAR 좌표계 |

## CLI 도구

```bash
# 두 프레임 간 변환 실시간 출력
ros2 run tf2_ros tf2_echo <parent_frame> <child_frame>
ros2 run tf2_ros tf2_echo map base_link
ros2 run tf2_ros tf2_echo base_link camera_link

# TF 트리를 PDF로 저장
ros2 run tf2_tools view_frames
# -> 현재 디렉토리에 frames_TIMESTAMP.pdf 생성

# RViz2에서 TF 시각화
rviz2
# Displays 패널 -> Add -> TF

# 정적 변환 발행 (x y z qx qy qz qw)
ros2 run tf2_ros static_transform_publisher \
  0.1 0.0 0.2 0.0 0.0 0.0 1.0 base_link camera_link

# 정적 변환 발행 (roll pitch yaw 사용, Humble 권장)
ros2 run tf2_ros static_transform_publisher \
  --x 0.1 --y 0.0 --z 0.2 \
  --roll 0.0 --pitch 0.0 --yaw 0.0 \
  --frame-id base_link --child-frame-id camera_link
```

## TF2 Broadcaster (Python)

동적으로 변환 정보를 발행하는 예시 (로봇 위치를 odom -> base_link로 발행).

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import TransformStamped
from tf2_ros import TransformBroadcaster
import math

class TurtleTFBroadcaster(Node):
    def __init__(self):
        super().__init__('turtle_tf_broadcaster')
        # TransformBroadcaster 생성
        self.tf_broadcaster = TransformBroadcaster(self)
        # 타이머로 주기적 발행
        self.timer = self.create_timer(0.1, self.broadcast_transform)
        self.x = 0.0
        self.y = 0.0
        self.theta = 0.0

    def broadcast_transform(self):
        t = TransformStamped()

        # 헤더 설정
        t.header.stamp = self.get_clock().now().to_msg()
        t.header.frame_id = 'odom'  # 부모 프레임
        t.child_frame_id = 'base_link'  # 자식 프레임

        # 평행이동 설정
        t.transform.translation.x = self.x
        t.transform.translation.y = self.y
        t.transform.translation.z = 0.0

        # 회전 설정 (Euler -> Quaternion)
        t.transform.rotation.x = 0.0
        t.transform.rotation.y = 0.0
        t.transform.rotation.z = math.sin(self.theta / 2)
        t.transform.rotation.w = math.cos(self.theta / 2)

        # 변환 발행
        self.tf_broadcaster.sendTransform(t)

def main(args=None):
    rclpy.init(args=args)
    node = TurtleTFBroadcaster()
    rclpy.spin(node)
    rclpy.shutdown()
```

## 정적 TF Broadcaster (Python)

변하지 않는 고정 변환(예: 센서 마운트 위치) 발행.

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import TransformStamped
from tf2_ros.static_transform_broadcaster import StaticTransformBroadcaster

class StaticBroadcaster(Node):
    def __init__(self):
        super().__init__('static_tf_broadcaster')
        self.static_broadcaster = StaticTransformBroadcaster(self)
        self.publish_static_transform()

    def publish_static_transform(self):
        t = TransformStamped()

        t.header.stamp = self.get_clock().now().to_msg()
        t.header.frame_id = 'base_link'
        t.child_frame_id = 'camera_link'

        # 카메라가 base_link 기준 앞 0.1m, 위 0.2m에 위치
        t.transform.translation.x = 0.1
        t.transform.translation.y = 0.0
        t.transform.translation.z = 0.2

        # 회전 없음 (단위 쿼터니언)
        t.transform.rotation.x = 0.0
        t.transform.rotation.y = 0.0
        t.transform.rotation.z = 0.0
        t.transform.rotation.w = 1.0

        self.static_broadcaster.sendTransform(t)
        self.get_logger().info('정적 변환 발행 완료: base_link -> camera_link')

def main(args=None):
    rclpy.init(args=args)
    node = StaticBroadcaster()
    rclpy.spin(node)
    rclpy.shutdown()
```

## TF2 Listener (Python)

다른 노드가 발행한 변환 정보를 읽어오는 예시.

```python
import rclpy
from rclpy.node import Node
from tf2_ros import TransformException
from tf2_ros.buffer import Buffer
from tf2_ros.transform_listener import TransformListener

class TFListener(Node):
    def __init__(self):
        super().__init__('tf_listener')

        # TF 버퍼와 리스너 생성
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

        # 1초마다 변환 조회
        self.timer = self.create_timer(1.0, self.lookup_transform)

    def lookup_transform(self):
        try:
            # 현재 시간 기준 변환 조회
            t = self.tf_buffer.lookup_transform(
                'map',        # 목표 프레임 (to_frame)
                'base_link',  # 소스 프레임 (from_frame)
                rclpy.time.Time()  # 최신 변환
            )

            pos = t.transform.translation
            rot = t.transform.rotation
            self.get_logger().info(
                f'map -> base_link:\n'
                f'  위치: x={pos.x:.3f}, y={pos.y:.3f}, z={pos.z:.3f}\n'
                f'  회전: x={rot.x:.3f}, y={rot.y:.3f}, '
                f'z={rot.z:.3f}, w={rot.w:.3f}'
            )

        except TransformException as ex:
            self.get_logger().warn(f'변환 조회 실패: {ex}')

    def lookup_transform_at_time(self):
        """특정 시간의 변환 조회"""
        try:
            from rclpy.duration import Duration

            t = self.tf_buffer.lookup_transform(
                'map',
                'base_link',
                rclpy.time.Time(),
                timeout=Duration(seconds=1.0)  # 최대 1초 대기
            )
            return t
        except TransformException as ex:
            self.get_logger().error(f'변환 조회 실패: {ex}')
            return None

def main(args=None):
    rclpy.init(args=args)
    node = TFListener()
    rclpy.spin(node)
    rclpy.shutdown()
```

## 좌표 변환 (포인트 변환)

```python
import rclpy
from rclpy.node import Node
from tf2_ros.buffer import Buffer
from tf2_ros.transform_listener import TransformListener
import tf2_geometry_msgs  # geometry_msgs 변환 지원
from geometry_msgs.msg import PointStamped

class PointTransformer(Node):
    def __init__(self):
        super().__init__('point_transformer')
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

    def transform_point(self, x, y, z, from_frame, to_frame):
        """포인트를 다른 좌표계로 변환"""
        point = PointStamped()
        point.header.frame_id = from_frame
        point.header.stamp = self.get_clock().now().to_msg()
        point.point.x = x
        point.point.y = y
        point.point.z = z

        try:
            transformed = self.tf_buffer.transform(
                point, to_frame,
                timeout=rclpy.duration.Duration(seconds=1.0)
            )
            return transformed.point
        except Exception as e:
            self.get_logger().error(f'변환 실패: {e}')
            return None
```

## Euler 각도와 Quaternion 변환

```python
import math
from geometry_msgs.msg import Quaternion

def euler_to_quaternion(roll, pitch, yaw):
    """Euler 각도 -> Quaternion 변환"""
    cr = math.cos(roll * 0.5)
    sr = math.sin(roll * 0.5)
    cp = math.cos(pitch * 0.5)
    sp = math.sin(pitch * 0.5)
    cy = math.cos(yaw * 0.5)
    sy = math.sin(yaw * 0.5)

    q = Quaternion()
    q.w = cr * cp * cy + sr * sp * sy
    q.x = sr * cp * cy - cr * sp * sy
    q.y = cr * sp * cy + sr * cp * sy
    q.z = cr * cp * sy - sr * sp * cy
    return q

def quaternion_to_euler(x, y, z, w):
    """Quaternion -> Euler 각도 변환"""
    # Roll (x축 회전)
    sinr_cosp = 2 * (w * x + y * z)
    cosr_cosp = 1 - 2 * (x * x + y * y)
    roll = math.atan2(sinr_cosp, cosr_cosp)

    # Pitch (y축 회전)
    sinp = 2 * (w * y - z * x)
    if abs(sinp) >= 1:
        pitch = math.copysign(math.pi / 2, sinp)
    else:
        pitch = math.asin(sinp)

    # Yaw (z축 회전)
    siny_cosp = 2 * (w * z + x * y)
    cosy_cosp = 1 - 2 * (y * y + z * z)
    yaw = math.atan2(siny_cosp, cosy_cosp)

    return roll, pitch, yaw

# 또는 scipy 사용 (더 간편)
# pip install scipy
from scipy.spatial.transform import Rotation
r = Rotation.from_euler('xyz', [roll, pitch, yaw])
quat = r.as_quat()  # [x, y, z, w]
```

::: tip TF2 패키지 설치
```bash
sudo apt install ros-humble-tf2-ros ros-humble-tf2-tools ros-humble-tf2-geometry-msgs
```
:::
