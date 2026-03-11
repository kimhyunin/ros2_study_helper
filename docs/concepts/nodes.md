# ROS2 Node

## Node란?

Node는 ROS2에서 **최소 실행 단위**입니다. 하나의 노드는 단일 목적의 처리 단위(예: 카메라 드라이버, 경로 계획, 모터 제어 등)를 수행합니다.

- 각 노드는 독립적인 프로세스 또는 같은 프로세스 내 스레드로 실행될 수 있습니다.
- 노드들은 **Topic, Service, Action, Parameter**를 통해 서로 통신합니다.
- ROS2에서는 단일 프로세스 내에 여러 노드를 실행하는 **Composition**도 지원합니다.

```
[camera_node] --토픽--> [image_processor_node] --토픽--> [object_detector_node]
```

---

## 🐢 Turtlesim으로 배우는 Node

turtlesim은 ROS2 개념을 익히기 위한 가장 기본적인 시뮬레이터입니다.

### 실행해보기

터미널을 **3개** 열고 각각 실행합니다.

```bash
# 터미널 1 — 시뮬레이터 실행
ros2 run turtlesim turtlesim_node

# 터미널 2 — 키보드 조종 노드 실행
ros2 run turtlesim turtle_teleop_key

# 터미널 3 — 실행 중인 노드 확인
ros2 node list
```

**출력 결과:**
```
/turtlesim
/teleop_turtle
```

두 개의 노드가 실행 중입니다. `turtlesim_node`가 `/turtlesim` 노드를, `turtle_teleop_key`가 `/teleop_turtle` 노드를 만들었습니다.

### 노드 상세 정보 확인

```bash
ros2 node info /turtlesim
```

```
/turtlesim
  Subscribers:
    /turtle1/cmd_vel: geometry_msgs/msg/Twist        # 속도 명령 수신
  Publishers:
    /turtle1/color_sensor: turtlesim/msg/Color       # 펜 색상 발행
    /turtle1/pose: turtlesim/msg/Pose                # 위치 발행
  Service Servers:
    /clear: std_srvs/srv/Empty
    /kill: turtlesim/srv/Kill
    /reset: turtlesim/srv/Empty
    /spawn: turtlesim/srv/Spawn
    /turtle1/set_pen: turtlesim/srv/SetPen
    /turtle1/teleport_absolute: turtlesim/srv/TeleportAbsolute
    /turtle1/teleport_relative: turtlesim/srv/TeleportRelative
  Action Servers:
    /turtle1/rotate_absolute: turtlesim/action/RotateAbsolute
```

### 노드 이름 변경 (Remapping)

```bash
# 노드 이름을 my_turtle로 바꿔서 실행
ros2 run turtlesim turtlesim_node --ros-args --remap __node:=my_turtle

# 확인
ros2 node list
# /my_turtle
# /teleop_turtle
```

::: info rqt_graph로 시각화
```bash
rqt_graph
```
노드 간의 연결 관계를 그래프로 볼 수 있습니다. `/teleop_turtle` → `/turtle1/cmd_vel` → `/turtlesim` 흐름을 확인하세요.
:::

---

## Node 생명주기 (Lifecycle)

Managed Node(lifecycle node)를 사용하면 노드의 상태를 체계적으로 관리할 수 있습니다.

```
Unconfigured --[configure]--> Inactive --[activate]--> Active
    ^                             |                      |
    |                         [cleanup]             [deactivate]
    |                             v                      v
    +--[shutdown]----------- Finalized <-------- Inactive
```

| 상태 | 설명 |
|------|------|
| `Unconfigured` | 초기 상태. 리소스 할당 전 |
| `Inactive` | 설정 완료. 통신 미활성 |
| `Active` | 정상 동작 중 |
| `Finalized` | 종료 완료 |

---

## CLI 명령어 정리

```bash
# 노드 실행
ros2 run <패키지> <실행파일>

# 노드 이름 변경 후 실행
ros2 run <패키지> <실행파일> --ros-args --remap __node:=<새이름>

# 네임스페이스 추가
ros2 run <패키지> <실행파일> --ros-args -r __ns:=/robot1

# 실행 중인 노드 목록
ros2 node list

# 노드 상세 정보 (구독, 발행, 서비스, 액션 목록)
ros2 node info /노드이름
```

---

## 기본 Node 구조 (rclpy)

### 최소 Node

```python
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        super().__init__('minimal_node')
        self.get_logger().info('노드가 시작되었습니다!')

def main(args=None):
    rclpy.init(args=args)
    node = MinimalNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Timer를 사용하는 Node

```python
import rclpy
from rclpy.node import Node

class TimerNode(Node):
    def __init__(self):
        super().__init__('timer_node')
        # 1초마다 timer_callback 실행
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.count = 0

    def timer_callback(self):
        self.count += 1
        self.get_logger().info(f'카운트: {self.count}')

def main(args=None):
    rclpy.init(args=args)
    node = TimerNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Lifecycle Node

```python
import rclpy
from rclpy.lifecycle import LifecycleNode
from rclpy.lifecycle import TransitionCallbackReturn

class MyLifecycleNode(LifecycleNode):
    def __init__(self):
        super().__init__('my_lifecycle_node')

    def on_configure(self, state):
        self.get_logger().info('노드 설정 중...')
        return TransitionCallbackReturn.SUCCESS

    def on_activate(self, state):
        self.get_logger().info('노드 활성화!')
        return TransitionCallbackReturn.SUCCESS

    def on_deactivate(self, state):
        self.get_logger().info('노드 비활성화')
        return TransitionCallbackReturn.SUCCESS

    def on_cleanup(self, state):
        self.get_logger().info('노드 정리 중...')
        return TransitionCallbackReturn.SUCCESS

    def on_shutdown(self, state):
        self.get_logger().info('노드 종료')
        return TransitionCallbackReturn.SUCCESS

def main(args=None):
    rclpy.init(args=args)
    node = MyLifecycleNode()
    rclpy.spin(node)
    rclpy.shutdown()
```

---

## 로깅

```python
self.get_logger().debug('디버그 메시지')
self.get_logger().info('정보 메시지')
self.get_logger().warn('경고 메시지')
self.get_logger().error('에러 메시지')
self.get_logger().fatal('치명적 에러')

# 일정 시간마다만 로그 출력 (스팸 방지)
self.get_logger().info('1초마다 출력', throttle_duration_sec=1.0)
```

---

::: tip 노드 이름 규칙
- 소문자와 밑줄 사용: `my_node`, `camera_driver`
- 네임스페이스 활용: `/robot1/camera_node`
- 노드 이름은 시스템 내에서 고유해야 합니다
:::

::: warning 노드 소멸 순서
`rclpy.spin()` 종료 후 반드시 `node.destroy_node()`와 `rclpy.shutdown()`을 호출하세요. 그렇지 않으면 리소스 누수가 발생할 수 있습니다.
:::

::: info Composition
성능이 중요한 경우, 여러 노드를 같은 프로세스에서 실행하는 Composition을 사용하세요. 토픽 메시지를 직렬화/역직렬화 없이 포인터로 전달하여 오버헤드를 줄일 수 있습니다.
:::
