# ROS2 Parameters

## Parameter란?

Parameter는 노드가 실행 중에 설정값을 외부에서 읽고 변경할 수 있게 해주는 메커니즘입니다. 하드코딩 대신 파라미터를 사용하면 재컴파일 없이 동작을 변경할 수 있습니다.

### 지원 타입

| 타입 | Python 예시 |
|------|------------|
| `bool` | `True`, `False` |
| `int` | `42` |
| `float` | `3.14` |
| `string` | `'hello'` |
| `byte_array` | `[0x01, 0x02]` |
| `bool_array` | `[True, False]` |
| `int_array` | `[1, 2, 3]` |
| `float_array` | `[1.0, 2.0]` |
| `string_array` | `['a', 'b', 'c']` |

## Parameter 선언 및 사용

```python
import rclpy
from rclpy.node import Node

class ParamNode(Node):
    def __init__(self):
        super().__init__('param_node')

        # 파라미터 선언 (이름, 기본값)
        self.declare_parameter('robot_name', 'my_robot')
        self.declare_parameter('max_speed', 1.0)
        self.declare_parameter('debug_mode', False)
        self.declare_parameter('waypoints', [0.0, 1.0, 2.0])

        # 파라미터 읽기
        robot_name = self.get_parameter('robot_name').get_parameter_value().string_value
        max_speed = self.get_parameter('max_speed').get_parameter_value().double_value
        debug_mode = self.get_parameter('debug_mode').get_parameter_value().bool_value

        self.get_logger().info(f'로봇 이름: {robot_name}')
        self.get_logger().info(f'최대 속도: {max_speed}')

        # 더 간단한 읽기 방법
        name = self.get_parameter('robot_name').value
        speed = self.get_parameter('max_speed').value

        # 타이머로 주기적 파라미터 사용
        self.timer = self.create_timer(1.0, self.timer_callback)

    def timer_callback(self):
        speed = self.get_parameter('max_speed').value
        self.get_logger().info(f'현재 최대 속도: {speed}')

def main(args=None):
    rclpy.init(args=args)
    node = ParamNode()
    rclpy.spin(node)
    rclpy.shutdown()
```

## Parameter 설명 추가 (ParameterDescriptor)

```python
from rclpy.node import Node
from rcl_interfaces.msg import ParameterDescriptor, FloatingPointRange

class DescribedParamNode(Node):
    def __init__(self):
        super().__init__('described_param_node')

        # 범위 제한이 있는 파라미터
        speed_descriptor = ParameterDescriptor(
            description='최대 이동 속도 (m/s)',
            floating_point_range=[FloatingPointRange(
                from_value=0.0,
                to_value=2.0,
                step=0.1
            )]
        )
        self.declare_parameter('max_speed', 0.5, speed_descriptor)

        # 읽기 전용 파라미터
        readonly_descriptor = ParameterDescriptor(
            description='로봇 고유 ID (변경 불가)',
            read_only=True
        )
        self.declare_parameter('robot_id', 'robot_001', readonly_descriptor)
```

## 파라미터 변경 콜백

```python
from rclpy.node import Node
from rcl_interfaces.msg import SetParametersResult

class DynamicParamNode(Node):
    def __init__(self):
        super().__init__('dynamic_param_node')
        self.declare_parameter('speed', 1.0)
        self.declare_parameter('enabled', True)

        # 파라미터 변경 콜백 등록
        self.add_on_set_parameters_callback(self.parameters_callback)

    def parameters_callback(self, params):
        for param in params:
            if param.name == 'speed':
                if param.value < 0:
                    return SetParametersResult(
                        successful=False,
                        reason='속도는 0 이상이어야 합니다'
                    )
                self.get_logger().info(f'속도 변경: {param.value}')

            elif param.name == 'enabled':
                self.get_logger().info(
                    f'상태 변경: {"활성화" if param.value else "비활성화"}'
                )

        return SetParametersResult(successful=True)
```

## YAML 파일로 파라미터 관리

### params.yaml 파일 작성

```yaml
# config/my_params.yaml

my_node:         # 노드 이름
  ros__parameters:  # 이 키워드는 고정
    robot_name: "my_robot"
    max_speed: 1.5
    debug_mode: false
    waypoints: [0.0, 1.0, 2.0, 3.0]
    pid:
      kp: 1.0
      ki: 0.1
      kd: 0.01
```

### 런치 파일에서 파라미터 파일 로드

```python
# launch/my_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_package',
            executable='my_node',
            name='my_node',
            parameters=[
                '/path/to/params.yaml',
                # 또는 딕셔너리로 직접 지정
                {'max_speed': 2.0, 'debug_mode': True}
            ]
        )
    ])
```

### CLI에서 파라미터 파일 로드

```bash
# 실행 시 파라미터 파일 지정
ros2 run my_package my_node --ros-args --params-file config/params.yaml

# 여러 파라미터 파일 지정
ros2 run my_package my_node \
  --ros-args \
  --params-file config/defaults.yaml \
  --params-file config/override.yaml
```

## CLI로 파라미터 관리

```bash
# 파라미터 목록
ros2 param list
ros2 param list /my_node

# 파라미터 값 읽기
ros2 param get /my_node max_speed

# 파라미터 값 변경
ros2 param set /my_node max_speed 2.0
ros2 param set /my_node debug_mode true
ros2 param set /my_node robot_name "new_robot"

# 파라미터 덤프 (현재 값을 YAML로 출력)
ros2 param dump /my_node

# 파라미터 덤프를 파일로 저장
ros2 param dump /my_node > my_node_params.yaml

# 파라미터 파일 로드
ros2 param load /my_node saved_params.yaml

# 파라미터 설명 확인
ros2 param describe /my_node max_speed
```

## 여러 파라미터 한번에 읽기

```python
class MultiParamNode(Node):
    def __init__(self):
        super().__init__('multi_param_node')

        # 여러 파라미터 선언
        params = [
            ('kp', 1.0),
            ('ki', 0.1),
            ('kd', 0.01),
            ('setpoint', 0.0),
        ]
        for name, default in params:
            self.declare_parameter(name, default)

        # 여러 파라미터 한번에 읽기
        kp, ki, kd, setpoint = self.get_parameters(
            ['kp', 'ki', 'kd', 'setpoint']
        )

        self.kp = kp.value
        self.ki = ki.value
        self.kd = kd.value
        self.get_logger().info(
            f'PID 설정: kp={self.kp}, ki={self.ki}, kd={self.kd}'
        )
```

::: tip 파라미터 네이밍 규칙
- 중첩 파라미터는 `.`으로 구분: `pid.kp`, `pid.ki`
- YAML에서는 중첩 딕셔너리로 표현
- 언더스코어 사용 권장: `max_speed` (camelCase X)
:::

::: warning 파라미터 선언 필수
ROS2에서는 파라미터를 사용하기 전에 반드시 `declare_parameter()`로 선언해야 합니다. 선언하지 않은 파라미터를 `get_parameter()`로 읽으면 예외가 발생합니다.
:::
