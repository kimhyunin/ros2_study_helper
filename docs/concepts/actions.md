# ROS2 Action
![action_image](https://docs.ros.org/en/humble/_images/Action-SingleActionClient.gif)

## Action이란?

Action은 **장시간 실행 작업**을 위한 통신 방식입니다. Goal을 보내면 서버가 작업을 수행하면서 중간중간 Feedback을 전송하고, 완료 시 Result를 반환합니다.

```
[Action Client] --Goal--> [Action Server]
[Action Client] <--Feedback-- [Action Server] (작업 중 반복)
[Action Client] <--Result-- [Action Server]  (완료 시 1회)
```

### Action의 3가지 구성 요소

| 구성요소 | 설명 | 방향 |
|---------|------|------|
| **Goal** | 수행할 작업 목표 | 클라이언트 → 서버 |
| **Feedback** | 진행 상황 보고 | 서버 → 클라이언트 (반복) |
| **Result** | 최종 결과 | 서버 → 클라이언트 (1회) |

### Service vs Action 비교

| 구분 | Service | Action |
|------|---------|--------|
| 작업 시간 | 짧은 작업 | 장시간 작업 |
| 중간 피드백 | 없음 | 있음 |
| 취소 가능 | 불가 | 가능 |
| 예시 | 파라미터 변경 | 내비게이션, 로봇 팔 이동 |

---

## 🐢 Turtlesim으로 배우는 Action

turtlesim에는 `/turtle1/rotate_absolute` 액션이 내장되어 있습니다. 거북이를 특정 각도(절대값)로 회전시키는 장시간 작업입니다.

### 준비

```bash
ros2 run turtlesim turtlesim_node
ros2 run turtlesim turtle_teleop_key
```

teleop 터미널에서 **G, B, V, C, D, E, R, T** 키를 누르면 방향 회전 액션이 실행됩니다. **F** 키는 Goal 취소입니다.

### 액션 목록 확인

```bash
ros2 action list -t
```

```
/turtle1/rotate_absolute [turtlesim/action/RotateAbsolute]
```

### 액션 구조 확인

```bash
ros2 interface show turtlesim/action/RotateAbsolute
```

```
# Goal — 목표 각도 (라디안)
float32 theta
---
# Result — 실제 회전한 각도 차이
float32 delta
---
# Feedback — 남은 회전량 (실시간)
float32 remaining
```

### CLI에서 Goal 전송

```bash
# 1.57 라디안(약 90도)으로 회전
ros2 action send_goal /turtle1/rotate_absolute \
  turtlesim/action/RotateAbsolute "{theta: 1.57}"
```

```
Waiting for an action server to become available...
Sending goal:
   theta: 1.5700000524520874

Goal accepted with ID: ...
Result:
   delta: -1.5520004034042358
Goal finished with status: SUCCEEDED
```

### Feedback 실시간 확인

```bash
ros2 action send_goal --feedback /turtle1/rotate_absolute \
  turtlesim/action/RotateAbsolute "{theta: -1.57}"
```

```
Feedback:
   remaining: -1.5520004034042358
Feedback:
   remaining: -1.3020004034042358
...
Result:
   delta: 1.5520004034042358
```

::: tip Goal 취소
CLI에서 `Ctrl+C`를 누르거나, teleop 터미널에서 **F** 키를 누르면 진행 중인 Goal이 취소됩니다.
새 Goal이 들어오면 이전 Goal은 자동으로 중단됩니다.
:::

---

## Action 인터페이스 파일 구조

```
# my_package/action/Fibonacci.action

# Goal 정의
int32 order
---
# Result 정의
int32[] sequence
---
# Feedback 정의
int32[] partial_sequence
```

## Action Server 예시 (Python)

```python
import time
import rclpy
from rclpy.action import ActionServer
from rclpy.node import Node
from action_tutorials_interfaces.action import Fibonacci

class FibonacciActionServer(Node):
    def __init__(self):
        super().__init__('fibonacci_action_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            self.execute_callback
        )
        self.get_logger().info('피보나치 액션 서버 시작')

    def execute_callback(self, goal_handle):
        self.get_logger().info(f'Goal 수신: order={goal_handle.request.order}')

        feedback_msg = Fibonacci.Feedback()
        feedback_msg.partial_sequence = [0, 1]

        # 피보나치 수열 계산 (중간 피드백 전송)
        for i in range(1, goal_handle.request.order):
            feedback_msg.partial_sequence.append(
                feedback_msg.partial_sequence[i] +
                feedback_msg.partial_sequence[i - 1]
            )

            # 피드백 전송
            self.get_logger().info(f'피드백: {feedback_msg.partial_sequence}')
            goal_handle.publish_feedback(feedback_msg)

            time.sleep(1)  # 실제 처리 시뮬레이션

        # 성공으로 Goal 완료 표시
        goal_handle.succeed()

        result = Fibonacci.Result()
        result.sequence = feedback_msg.partial_sequence
        return result

def main(args=None):
    rclpy.init(args=args)
    node = FibonacciActionServer()
    rclpy.spin(node)
    rclpy.shutdown()
```

## Action Client 예시 (Python)

```python
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from action_tutorials_interfaces.action import Fibonacci

class FibonacciActionClient(Node):
    def __init__(self):
        super().__init__('fibonacci_action_client')
        self._action_client = ActionClient(self, Fibonacci, 'fibonacci')

    def send_goal(self, order):
        goal_msg = Fibonacci.Goal()
        goal_msg.order = order

        self.get_logger().info('서버 대기 중...')
        self._action_client.wait_for_server()

        self.get_logger().info(f'Goal 전송: order={order}')
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback
        )
        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Goal 거부됨')
            return

        self.get_logger().info('Goal 수락됨!')
        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.get_result_callback)

    def get_result_callback(self, future):
        result = future.result().result
        self.get_logger().info(f'최종 결과: {result.sequence}')
        rclpy.shutdown()

    def feedback_callback(self, feedback_msg):
        feedback = feedback_msg.feedback
        self.get_logger().info(f'피드백 수신: {feedback.partial_sequence}')

def main(args=None):
    rclpy.init(args=args)
    node = FibonacciActionClient()
    node.send_goal(10)
    rclpy.spin(node)

if __name__ == '__main__':
    main()
```

## Goal 취소 기능

```python
# Action Client에서 Goal 취소
class CancellableClient(Node):
    def __init__(self):
        super().__init__('cancellable_client')
        self._action_client = ActionClient(self, Fibonacci, 'fibonacci')
        self._goal_handle = None

    def send_goal(self, order):
        goal_msg = Fibonacci.Goal()
        goal_msg.order = order
        self._action_client.wait_for_server()

        send_future = self._action_client.send_goal_async(
            goal_msg, feedback_callback=self.feedback_callback
        )
        send_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        self._goal_handle = future.result()
        if self._goal_handle.accepted:
            # 3초 후 취소 타이머
            self.cancel_timer = self.create_timer(3.0, self.cancel_goal)

    def cancel_goal(self):
        self.cancel_timer.cancel()
        if self._goal_handle:
            cancel_future = self._goal_handle.cancel_goal_async()
            cancel_future.add_done_callback(self.cancel_done_callback)

    def cancel_done_callback(self, future):
        cancel_response = future.result()
        if len(cancel_response.goals_canceling) > 0:
            self.get_logger().info('Goal 취소 성공')
        else:
            self.get_logger().info('Goal 취소 실패')
```

## Action Server에서 취소 처리

```python
class CancellableServer(Node):
    def __init__(self):
        super().__init__('cancellable_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            self.execute_callback,
            cancel_callback=self.cancel_callback
        )

    def cancel_callback(self, goal_handle):
        self.get_logger().info('취소 요청 수신')
        return CancelResponse.ACCEPT  # 취소 수락

    def execute_callback(self, goal_handle):
        for i in range(goal_handle.request.order):
            # 취소 요청 확인
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                self.get_logger().info('Goal 취소됨')
                return Fibonacci.Result()

            # 작업 수행...
            time.sleep(1)

        goal_handle.succeed()
        return Fibonacci.Result(sequence=[...])
```

## 커스텀 Action 만들기

### action 파일 생성

```
# my_package/action/MoveRobot.action

# Goal
float64 target_x
float64 target_y
float64 target_yaw
---
# Result
bool success
float64 final_x
float64 final_y
---
# Feedback
float64 current_x
float64 current_y
float64 distance_remaining
```

### CMakeLists.txt

```cmake
find_package(rosidl_default_generators REQUIRED)

rosidl_generate_interfaces(${PROJECT_NAME}
  "action/MoveRobot.action"
)
```

## CLI로 Action 사용

```bash
# 액션 목록 (타입 포함)
ros2 action list -t

# 액션 정보
ros2 action info /fibonacci

# Goal 전송
ros2 action send_goal /fibonacci \
  action_tutorials_interfaces/action/Fibonacci '{order: 10}'

# Goal 전송 + 피드백 출력
ros2 action send_goal --feedback /fibonacci \
  action_tutorials_interfaces/action/Fibonacci '{order: 10}'
```

::: tip 실제 사용 예
- **Navigation2**: `NavigateToPose` 액션으로 목적지까지 자율주행
- **MoveIt2**: `MoveGroup` 액션으로 로봇 팔 이동
- **회전 명령**: `RotateAbsolute` 액션으로 특정 각도로 회전
:::
