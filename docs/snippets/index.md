# 코드 스니펫 모음

> 복사해서 바로 사용할 수 있는 rclpy 코드 스니펫. 각 스니펫은 독립적으로 실행 가능한 완전한 코드입니다.

## 1. 기본 Publisher

```python
#!/usr/bin/env python3
"""기본 문자열 Publisher 스니펫"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class BasicPublisher(Node):
    def __init__(self):
        super().__init__('basic_publisher')
        self.publisher_ = self.create_publisher(String, 'chatter', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello ROS2: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'발행: "{msg.data}"')
        self.i += 1


def main(args=None):
    rclpy.init(args=args)
    node = BasicPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## 2. 기본 Subscriber

```python
#!/usr/bin/env python3
"""기본 문자열 Subscriber 스니펫"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class BasicSubscriber(Node):
    def __init__(self):
        super().__init__('basic_subscriber')
        self.subscription = self.create_subscription(
            String,
            'chatter',
            self.listener_callback,
            10
        )

    def listener_callback(self, msg):
        self.get_logger().info(f'수신: "{msg.data}"')


def main(args=None):
    rclpy.init(args=args)
    node = BasicSubscriber()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## 3. Twist 발행 (로봇 이동)

```python
#!/usr/bin/env python3
"""cmd_vel Twist 메시지 발행 (로봇 이동 명령)"""

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist


class TwistPublisher(Node):
    def __init__(self):
        super().__init__('twist_publisher')
        self.publisher_ = self.create_publisher(Twist, '/cmd_vel', 10)
        self.timer = self.create_timer(0.1, self.timer_callback)  # 10Hz
        self.get_logger().info('Twist Publisher 시작')

    def timer_callback(self):
        msg = Twist()
        # 전진 속도 (m/s)
        msg.linear.x = 0.3
        msg.linear.y = 0.0
        msg.linear.z = 0.0
        # 회전 속도 (rad/s)
        msg.angular.x = 0.0
        msg.angular.y = 0.0
        msg.angular.z = 0.2  # 왼쪽으로 회전
        self.publisher_.publish(msg)

    def stop(self):
        """로봇 정지"""
        msg = Twist()  # 모든 값 0
        self.publisher_.publish(msg)


def main(args=None):
    rclpy.init(args=args)
    node = TwistPublisher()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.stop()  # Ctrl+C 시 정지
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## 4. Service Server

```python
#!/usr/bin/env python3
"""SetBool 서비스 서버 스니펫"""

import rclpy
from rclpy.node import Node
from std_srvs.srv import SetBool


class EnableServer(Node):
    def __init__(self):
        super().__init__('enable_server')
        self.enabled = False
        self.srv = self.create_service(
            SetBool,
            'enable',
            self.enable_callback
        )
        self.get_logger().info('서비스 서버 시작: /enable')

    def enable_callback(self, request, response):
        self.enabled = request.data
        response.success = True
        response.message = f'상태: {"활성화" if self.enabled else "비활성화"}'
        self.get_logger().info(response.message)
        return response


def main(args=None):
    rclpy.init(args=args)
    node = EnableServer()
    rclpy.spin(node)
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## 5. Service Client

```python
#!/usr/bin/env python3
"""SetBool 서비스 클라이언트 스니펫"""

import sys
import rclpy
from rclpy.node import Node
from std_srvs.srv import SetBool


class EnableClient(Node):
    def __init__(self):
        super().__init__('enable_client')
        self.client = self.create_client(SetBool, 'enable')

    def send_request(self, value: bool):
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('서비스 대기 중...')

        request = SetBool.Request()
        request.data = value

        future = self.client.call_async(request)
        rclpy.spin_until_future_complete(self, future)

        result = future.result()
        self.get_logger().info(
            f'응답: success={result.success}, message="{result.message}"'
        )
        return result


def main(args=None):
    rclpy.init(args=args)
    node = EnableClient()

    # 인수로 true/false 받기
    value = True if len(sys.argv) < 2 else sys.argv[1].lower() == 'true'
    node.send_request(value)

    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## 6. Action Server (피보나치)

```python
#!/usr/bin/env python3
"""피보나치 Action Server 스니펫"""

import time
import rclpy
from rclpy.action import ActionServer, CancelResponse, GoalResponse
from rclpy.node import Node
from action_tutorials_interfaces.action import Fibonacci


class FibonacciServer(Node):
    def __init__(self):
        super().__init__('fibonacci_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            self.execute_callback,
            goal_callback=self.goal_callback,
            cancel_callback=self.cancel_callback,
        )
        self.get_logger().info('피보나치 액션 서버 시작')

    def goal_callback(self, goal_request):
        """Goal 수락/거부 결정"""
        self.get_logger().info(f'Goal 수신: order={goal_request.order}')
        if goal_request.order > 50:
            self.get_logger().warn('order가 너무 큽니다. 거부합니다.')
            return GoalResponse.REJECT
        return GoalResponse.ACCEPT

    def cancel_callback(self, goal_handle):
        """취소 요청 처리"""
        self.get_logger().info('취소 요청 수신')
        return CancelResponse.ACCEPT

    def execute_callback(self, goal_handle):
        """실제 작업 실행"""
        self.get_logger().info(f'실행 중: order={goal_handle.request.order}')

        feedback = Fibonacci.Feedback()
        feedback.partial_sequence = [0, 1]

        for i in range(1, goal_handle.request.order):
            # 취소 확인
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                self.get_logger().info('Goal 취소됨')
                return Fibonacci.Result()

            # 다음 수 계산
            feedback.partial_sequence.append(
                feedback.partial_sequence[i] + feedback.partial_sequence[i - 1]
            )
            goal_handle.publish_feedback(feedback)
            time.sleep(0.5)

        goal_handle.succeed()
        result = Fibonacci.Result()
        result.sequence = feedback.partial_sequence
        self.get_logger().info(f'완료: {result.sequence}')
        return result


def main(args=None):
    rclpy.init(args=args)
    node = FibonacciServer()
    rclpy.spin(node)
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## 7. Action Client (피보나치)

```python
#!/usr/bin/env python3
"""피보나치 Action Client 스니펫"""

import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from action_tutorials_interfaces.action import Fibonacci


class FibonacciClient(Node):
    def __init__(self):
        super().__init__('fibonacci_client')
        self._client = ActionClient(self, Fibonacci, 'fibonacci')
        self._goal_handle = None

    def send_goal(self, order: int):
        goal_msg = Fibonacci.Goal()
        goal_msg.order = order

        self.get_logger().info('서버 대기 중...')
        self._client.wait_for_server()

        self.get_logger().info(f'Goal 전송: order={order}')
        future = self._client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback
        )
        future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        self._goal_handle = future.result()
        if not self._goal_handle.accepted:
            self.get_logger().warn('Goal 거부됨')
            return
        self.get_logger().info('Goal 수락됨')
        result_future = self._goal_handle.get_result_async()
        result_future.add_done_callback(self.result_callback)

    def result_callback(self, future):
        result = future.result().result
        status = future.result().status
        self.get_logger().info(f'결과 (status={status}): {result.sequence}')
        rclpy.shutdown()

    def feedback_callback(self, feedback_msg):
        seq = feedback_msg.feedback.partial_sequence
        self.get_logger().info(f'피드백: {seq}')

    def cancel(self):
        if self._goal_handle:
            self.get_logger().info('취소 요청 전송')
            self._goal_handle.cancel_goal_async()


def main(args=None):
    rclpy.init(args=args)
    node = FibonacciClient()
    node.send_goal(10)
    rclpy.spin(node)


if __name__ == '__main__':
    main()
```

## 8. TF2 Broadcaster

```python
#!/usr/bin/env python3
"""TF2 변환 발행 스니펫"""

import math
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import TransformStamped
from tf2_ros import TransformBroadcaster


class OdomTFBroadcaster(Node):
    def __init__(self):
        super().__init__('odom_tf_broadcaster')
        self.tf_broadcaster = TransformBroadcaster(self)
        self.timer = self.create_timer(0.05, self.broadcast_tf)  # 20Hz

        # 시뮬레이션 위치
        self.x = 0.0
        self.y = 0.0
        self.theta = 0.0

    def broadcast_tf(self):
        t = TransformStamped()
        t.header.stamp = self.get_clock().now().to_msg()
        t.header.frame_id = 'odom'
        t.child_frame_id = 'base_link'

        t.transform.translation.x = self.x
        t.transform.translation.y = self.y
        t.transform.translation.z = 0.0

        # Yaw만 있는 경우 쿼터니언 변환
        t.transform.rotation.x = 0.0
        t.transform.rotation.y = 0.0
        t.transform.rotation.z = math.sin(self.theta / 2.0)
        t.transform.rotation.w = math.cos(self.theta / 2.0)

        self.tf_broadcaster.sendTransform(t)

        # 위치 업데이트 (간단한 원운동 시뮬레이션)
        self.theta += 0.01


def main(args=None):
    rclpy.init(args=args)
    node = OdomTFBroadcaster()
    rclpy.spin(node)
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## 9. TF2 Listener

```python
#!/usr/bin/env python3
"""TF2 변환 조회 스니펫"""

import rclpy
from rclpy.node import Node
from tf2_ros import TransformException
from tf2_ros.buffer import Buffer
from tf2_ros.transform_listener import TransformListener


class TF2ListenerNode(Node):
    def __init__(self):
        super().__init__('tf2_listener')
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)
        self.timer = self.create_timer(1.0, self.lookup_transform)

    def lookup_transform(self):
        try:
            # map → base_link 변환 조회
            t = self.tf_buffer.lookup_transform(
                'map',
                'base_link',
                rclpy.time.Time()
            )
            p = t.transform.translation
            r = t.transform.rotation
            self.get_logger().info(
                f'map->base_link: pos=({p.x:.2f}, {p.y:.2f}, {p.z:.2f})'
                f' rot=({r.x:.2f}, {r.y:.2f}, {r.z:.2f}, {r.w:.2f})'
            )
        except TransformException as ex:
            self.get_logger().warn(f'TF 조회 실패: {ex}')


def main(args=None):
    rclpy.init(args=args)
    node = TF2ListenerNode()
    rclpy.spin(node)
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## 10. Parameter 사용 (선언 + 읽기 + 콜백)

```python
#!/usr/bin/env python3
"""파라미터 선언, 읽기, 동적 변경 처리 스니펫"""

import rclpy
from rclpy.node import Node
from rcl_interfaces.msg import ParameterDescriptor, SetParametersResult


class ParamDemoNode(Node):
    def __init__(self):
        super().__init__('param_demo_node')

        # 파라미터 선언 (이름, 기본값, 설명)
        self.declare_parameter(
            'speed', 1.0,
            ParameterDescriptor(description='이동 속도 (m/s)')
        )
        self.declare_parameter(
            'robot_name', 'my_robot',
            ParameterDescriptor(description='로봇 이름')
        )
        self.declare_parameter('debug', False)

        # 파라미터 변경 콜백 등록
        self.add_on_set_parameters_callback(self.param_callback)

        # 초기 값 읽기
        self.speed = self.get_parameter('speed').value
        self.robot_name = self.get_parameter('robot_name').value
        self.debug = self.get_parameter('debug').value

        self.get_logger().info(
            f'시작: robot={self.robot_name}, speed={self.speed}'
        )
        self.timer = self.create_timer(1.0, self.run)

    def param_callback(self, params):
        for p in params:
            if p.name == 'speed':
                if p.value < 0.0 or p.value > 3.0:
                    return SetParametersResult(
                        successful=False,
                        reason='속도는 0.0 ~ 3.0 범위여야 합니다'
                    )
                self.speed = p.value
                self.get_logger().info(f'속도 변경: {self.speed}')
            elif p.name == 'robot_name':
                self.robot_name = p.value
            elif p.name == 'debug':
                self.debug = p.value
        return SetParametersResult(successful=True)

    def run(self):
        if self.debug:
            self.get_logger().debug(
                f'[DEBUG] robot={self.robot_name}, speed={self.speed}'
            )
        self.get_logger().info(f'동작 중: speed={self.speed:.2f}')


def main(args=None):
    rclpy.init(args=args)
    node = ParamDemoNode()
    rclpy.spin(node)
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## 11. 멀티 스레드 Executor

```python
#!/usr/bin/env python3
"""멀티 스레드 Executor와 ReentrantCallbackGroup 스니펫"""

import rclpy
from rclpy.node import Node
from rclpy.executors import MultiThreadedExecutor
from rclpy.callback_groups import ReentrantCallbackGroup, MutuallyExclusiveCallbackGroup
from std_msgs.msg import String
from std_srvs.srv import Trigger


class MultiThreadNode(Node):
    def __init__(self):
        super().__init__('multi_thread_node')

        # ReentrantCallbackGroup: 동시 실행 허용
        reentrant_group = ReentrantCallbackGroup()
        # MutuallyExclusiveCallbackGroup: 동시 실행 금지
        exclusive_group = MutuallyExclusiveCallbackGroup()

        # 빠른 타이머 (10Hz)
        self.fast_timer = self.create_timer(
            0.1, self.fast_callback,
            callback_group=reentrant_group
        )

        # 느린 타이머 (1Hz)
        self.slow_timer = self.create_timer(
            1.0, self.slow_callback,
            callback_group=exclusive_group
        )

        # 서비스 서버 (별도 스레드로 처리)
        self.srv = self.create_service(
            Trigger, 'trigger', self.service_callback,
            callback_group=reentrant_group
        )

    def fast_callback(self):
        self.get_logger().debug('빠른 콜백 실행')

    def slow_callback(self):
        self.get_logger().info('느린 콜백 실행')

    def service_callback(self, request, response):
        import time
        self.get_logger().info('서비스 처리 중...')
        time.sleep(2.0)  # 긴 작업 시뮬레이션
        response.success = True
        response.message = '완료'
        return response


def main(args=None):
    rclpy.init(args=args)
    node = MultiThreadNode()
    executor = MultiThreadedExecutor(num_threads=4)
    executor.add_node(node)
    try:
        executor.spin()
    finally:
        executor.shutdown()
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## 12. LaserScan 구독 + 처리

```python
#!/usr/bin/env python3
"""LaserScan 데이터 구독 및 처리 스니펫"""

import rclpy
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from sensor_msgs.msg import LaserScan


class LidarProcessor(Node):
    def __init__(self):
        super().__init__('lidar_processor')
        # 센서 데이터는 qos_profile_sensor_data 사용 (BEST_EFFORT)
        self.subscription = self.create_subscription(
            LaserScan,
            '/scan',
            self.scan_callback,
            qos_profile_sensor_data
        )
        self.get_logger().info('LiDAR 처리기 시작: /scan 구독 중')

    def scan_callback(self, msg: LaserScan):
        # 스캔 정보
        num_points = len(msg.ranges)
        angle_min = msg.angle_min   # 최소 각도 (rad)
        angle_max = msg.angle_max   # 최대 각도 (rad)
        angle_inc = msg.angle_increment  # 각도 증가량 (rad)

        # 유효한 거리 값만 필터링 (inf, nan 제거)
        valid_ranges = [
            r for r in msg.ranges
            if msg.range_min < r < msg.range_max
        ]

        if valid_ranges:
            min_dist = min(valid_ranges)
            max_dist = max(valid_ranges)
            avg_dist = sum(valid_ranges) / len(valid_ranges)

            self.get_logger().info(
                f'포인트: {num_points}, 유효: {len(valid_ranges)}\n'
                f'  최소: {min_dist:.2f}m, 최대: {max_dist:.2f}m, '
                f'평균: {avg_dist:.2f}m'
            )

            # 정면 장애물 감지 (±10도)
            center_idx = num_points // 2
            front_range = 10  # 인덱스 범위
            front_data = msg.ranges[
                center_idx - front_range:center_idx + front_range
            ]
            front_min = min(
                r for r in front_data
                if msg.range_min < r < msg.range_max
            ) if front_data else float('inf')

            if front_min < 0.5:
                self.get_logger().warn(f'전방 장애물 감지: {front_min:.2f}m')


def main(args=None):
    rclpy.init(args=args)
    node = LidarProcessor()
    rclpy.spin(node)
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```
