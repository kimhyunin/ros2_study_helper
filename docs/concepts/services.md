# ROS2 Service

## Service란?

Service는 ROS2에서 **동기 양방향 통신** 방식입니다. 클라이언트가 **요청(Request)**을 보내면 서버가 처리 후 **응답(Response)**을 반환합니다. Topic과 달리 **요청-응답** 패턴으로, 결과가 필요할 때 사용합니다.

```
[Client Node] --Request--> [Service Server Node]
[Client Node] <--Response-- [Service Server Node]
```

### Topic vs Service 비교

| 구분 | Topic | Service |
|------|-------|---------|
| 방향 | 단방향 (발행 → 구독) | 양방향 (요청 → 응답) |
| 통신 | 비동기 | 동기 (응답 대기) |
| 관계 | 1:N | 1:1 |
| 용도 | 지속적 데이터 스트림 | 일회성 요청/응답 |
| 예시 | 센서 데이터, 속도 명령 | 파라미터 변경, 계산 요청 |

## Service 타입 확인

```bash
# 서비스 인터페이스 확인
ros2 interface show std_srvs/srv/SetBool
# 출력:
# bool data  # e.g. for hardware enable / disable
# ---
# bool success   # indicate successful run of triggered service
# string message # informational, e.g. for error messages
```

## Service Server 예시 (Python)

```python
import rclpy
from rclpy.node import Node
from std_srvs.srv import SetBool

class EnableService(Node):
    def __init__(self):
        super().__init__('enable_service_server')
        # 서비스 이름, 서비스 타입, 콜백 함수
        self.srv = self.create_service(
            SetBool,
            'enable_motor',
            self.enable_callback
        )
        self.motor_enabled = False
        self.get_logger().info('모터 서비스 서버 준비 완료')

    def enable_callback(self, request, response):
        # request.data: 요청 데이터 (bool)
        self.motor_enabled = request.data

        response.success = True
        response.message = f'모터 {"활성화" if self.motor_enabled else "비활성화"} 완료'

        self.get_logger().info(
            f'요청: {request.data} -> 응답: {response.message}'
        )
        return response

def main(args=None):
    rclpy.init(args=args)
    node = EnableService()
    rclpy.spin(node)
    rclpy.shutdown()
```

## Service Client 예시 (Python)

### 동기 방식 (단순하지만 블로킹)

```python
import rclpy
from rclpy.node import Node
from std_srvs.srv import SetBool

class EnableClient(Node):
    def __init__(self):
        super().__init__('enable_service_client')
        self.client = self.create_client(SetBool, 'enable_motor')

    def send_request(self, enable: bool):
        # 서버가 준비될 때까지 대기
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('서비스 대기 중...')

        request = SetBool.Request()
        request.data = enable

        # 동기 호출 (응답까지 블로킹)
        future = self.client.call_async(request)
        rclpy.spin_until_future_complete(self, future)

        if future.result() is not None:
            response = future.result()
            self.get_logger().info(
                f'응답: success={response.success}, message={response.message}'
            )
            return response
        else:
            self.get_logger().error('서비스 호출 실패')
            return None

def main(args=None):
    rclpy.init(args=args)
    node = EnableClient()
    response = node.send_request(True)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### 비동기 방식 (콜백 사용)

```python
import rclpy
from rclpy.node import Node
from std_srvs.srv import SetBool

class AsyncClient(Node):
    def __init__(self):
        super().__init__('async_client')
        self.client = self.create_client(SetBool, 'enable_motor')
        # 1초 후 요청 전송
        self.timer = self.create_timer(1.0, self.send_request)

    def send_request(self):
        self.timer.cancel()  # 한 번만 실행

        if not self.client.service_is_ready():
            self.get_logger().warn('서비스가 준비되지 않았습니다')
            return

        request = SetBool.Request()
        request.data = True

        # 비동기 호출
        future = self.client.call_async(request)
        future.add_done_callback(self.response_callback)

    def response_callback(self, future):
        try:
            response = future.result()
            self.get_logger().info(f'응답 수신: {response.message}')
        except Exception as e:
            self.get_logger().error(f'서비스 호출 예외: {e}')

def main(args=None):
    rclpy.init(args=args)
    node = AsyncClient()
    rclpy.spin(node)
    rclpy.shutdown()
```

## 커스텀 Service 인터페이스 만들기

### srv 파일 생성

```
# my_package/srv/AddTwoInts.srv
int64 a
int64 b
---
int64 sum
```

### CMakeLists.txt에 추가 (C++ 패키지)

```cmake
find_package(rosidl_default_generators REQUIRED)

rosidl_generate_interfaces(${PROJECT_NAME}
  "srv/AddTwoInts.srv"
)
```

### package.xml에 추가

```xml
<build_depend>rosidl_default_generators</build_depend>
<exec_depend>rosidl_default_runtime</exec_depend>
<member_of_group>rosidl_interface_packages</member_of_group>
```

### Python에서 커스텀 서비스 사용

```python
from my_package.srv import AddTwoInts

class AddServer(Node):
    def __init__(self):
        super().__init__('add_two_ints_server')
        self.srv = self.create_service(
            AddTwoInts, 'add_two_ints', self.add_callback
        )

    def add_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'{request.a} + {request.b} = {response.sum}')
        return response
```

## 자주 쓰는 서비스 타입

```python
# std_srvs
from std_srvs.srv import Empty      # 요청/응답 모두 없음
from std_srvs.srv import SetBool    # bool 요청, bool+string 응답
from std_srvs.srv import Trigger    # 요청 없음, bool+string 응답

# rcl_interfaces
from rcl_interfaces.srv import SetParameters  # 파라미터 설정
from rcl_interfaces.srv import GetParameters  # 파라미터 조회

# nav_msgs
from nav_msgs.srv import GetMap     # 지도 요청
from nav_msgs.srv import GetPlan    # 경로 계획 요청
```

## CLI로 서비스 사용

```bash
# 서비스 목록
ros2 service list -t

# SetBool 서비스 호출
ros2 service call /enable_motor std_srvs/srv/SetBool '{data: true}'

# Trigger 서비스 호출
ros2 service call /reset std_srvs/srv/Trigger

# Empty 서비스 호출
ros2 service call /clear std_srvs/srv/Empty

# 커스텀 서비스 호출
ros2 service call /add_two_ints my_package/srv/AddTwoInts '{a: 5, b: 3}'
```

::: tip 서비스 타임아웃
장시간 처리가 필요한 작업은 Service 대신 **Action**을 사용하세요. Service는 클라이언트가 응답을 기다리는 동안 블로킹됩니다.
:::
