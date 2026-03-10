# C++ 코드 스니펫 (rclcpp)

> 복사해서 바로 사용할 수 있는 rclcpp 코드 스니펫입니다.

## 1. 기본 Publisher

```cpp
// src/basic_publisher.cpp
#include <chrono>
#include <string>
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

using namespace std::chrono_literals;

class BasicPublisher : public rclcpp::Node
{
public:
  BasicPublisher() : Node("basic_publisher"), count_(0)
  {
    publisher_ = this->create_publisher<std_msgs::msg::String>("chatter", 10);
    timer_ = this->create_wall_timer(500ms, std::bind(&BasicPublisher::timer_callback, this));
  }

private:
  void timer_callback()
  {
    auto message = std_msgs::msg::String();
    message.data = "Hello ROS2: " + std::to_string(count_++);
    RCLCPP_INFO(this->get_logger(), "발행: '%s'", message.data.c_str());
    publisher_->publish(message);
  }

  rclcpp::TimerBase::SharedPtr timer_;
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr publisher_;
  size_t count_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<BasicPublisher>());
  rclcpp::shutdown();
  return 0;
}
```

## 2. 기본 Subscriber

```cpp
// src/basic_subscriber.cpp
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

class BasicSubscriber : public rclcpp::Node
{
public:
  BasicSubscriber() : Node("basic_subscriber")
  {
    subscription_ = this->create_subscription<std_msgs::msg::String>(
      "chatter", 10,
      std::bind(&BasicSubscriber::topic_callback, this, std::placeholders::_1));
  }

private:
  void topic_callback(const std_msgs::msg::String & msg)
  {
    RCLCPP_INFO(this->get_logger(), "수신: '%s'", msg.data.c_str());
  }

  rclcpp::Subscription<std_msgs::msg::String>::SharedPtr subscription_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<BasicSubscriber>());
  rclcpp::shutdown();
  return 0;
}
```

## 3. Service Server

```cpp
// src/enable_server.cpp
#include "rclcpp/rclcpp.hpp"
#include "std_srvs/srv/set_bool.hpp"

class EnableServer : public rclcpp::Node
{
public:
  EnableServer() : Node("enable_server"), enabled_(false)
  {
    service_ = this->create_service<std_srvs::srv::SetBool>(
      "enable",
      std::bind(&EnableServer::enable_callback, this,
        std::placeholders::_1, std::placeholders::_2));
    RCLCPP_INFO(this->get_logger(), "서비스 서버 시작: /enable");
  }

private:
  void enable_callback(
    const std::shared_ptr<std_srvs::srv::SetBool::Request> request,
    std::shared_ptr<std_srvs::srv::SetBool::Response> response)
  {
    enabled_ = request->data;
    response->success = true;
    response->message = enabled_ ? "활성화" : "비활성화";
    RCLCPP_INFO(this->get_logger(), "상태: %s", response->message.c_str());
  }

  rclcpp::Service<std_srvs::srv::SetBool>::SharedPtr service_;
  bool enabled_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<EnableServer>());
  rclcpp::shutdown();
  return 0;
}
```

## 4. Service Client

```cpp
// src/enable_client.cpp
#include "rclcpp/rclcpp.hpp"
#include "std_srvs/srv/set_bool.hpp"

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  auto node = rclcpp::Node::make_shared("enable_client");
  auto client = node->create_client<std_srvs::srv::SetBool>("enable");

  // 서비스 대기
  while (!client->wait_for_service(std::chrono::seconds(1))) {
    RCLCPP_INFO(node->get_logger(), "서비스 대기 중...");
  }

  auto request = std::make_shared<std_srvs::srv::SetBool::Request>();
  request->data = true;

  auto future = client->async_send_request(request);

  if (rclcpp::spin_until_future_complete(node, future) ==
    rclcpp::FutureReturnCode::SUCCESS)
  {
    auto result = future.get();
    RCLCPP_INFO(node->get_logger(), "응답: success=%s, message='%s'",
      result->success ? "true" : "false", result->message.c_str());
  } else {
    RCLCPP_ERROR(node->get_logger(), "서비스 호출 실패");
  }

  rclcpp::shutdown();
  return 0;
}
```

## 5. Action Server (피보나치)

```cpp
// src/fibonacci_server.cpp
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"
#include "action_tutorials_interfaces/action/fibonacci.hpp"

class FibonacciServer : public rclcpp::Node
{
public:
  using Fibonacci = action_tutorials_interfaces::action::Fibonacci;
  using GoalHandleFibonacci = rclcpp_action::ServerGoalHandle<Fibonacci>;

  FibonacciServer() : Node("fibonacci_server")
  {
    action_server_ = rclcpp_action::create_server<Fibonacci>(
      this, "fibonacci",
      std::bind(&FibonacciServer::handle_goal, this,
        std::placeholders::_1, std::placeholders::_2),
      std::bind(&FibonacciServer::handle_cancel, this, std::placeholders::_1),
      std::bind(&FibonacciServer::handle_accepted, this, std::placeholders::_1));
    RCLCPP_INFO(this->get_logger(), "피보나치 액션 서버 시작");
  }

private:
  rclcpp_action::GoalResponse handle_goal(
    const rclcpp_action::GoalUUID &,
    std::shared_ptr<const Fibonacci::Goal> goal)
  {
    RCLCPP_INFO(this->get_logger(), "Goal 수신: order=%d", goal->order);
    if (goal->order > 50) {
      RCLCPP_WARN(this->get_logger(), "order가 너무 큽니다. 거부합니다.");
      return rclcpp_action::GoalResponse::REJECT;
    }
    return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE;
  }

  rclcpp_action::CancelResponse handle_cancel(
    const std::shared_ptr<GoalHandleFibonacci>)
  {
    RCLCPP_INFO(this->get_logger(), "취소 요청 수신");
    return rclcpp_action::CancelResponse::ACCEPT;
  }

  void handle_accepted(const std::shared_ptr<GoalHandleFibonacci> goal_handle)
  {
    std::thread{
      std::bind(&FibonacciServer::execute, this, std::placeholders::_1),
      goal_handle
    }.detach();
  }

  void execute(const std::shared_ptr<GoalHandleFibonacci> goal_handle)
  {
    auto feedback = std::make_shared<Fibonacci::Feedback>();
    auto & seq = feedback->partial_sequence;
    seq.push_back(0);
    seq.push_back(1);

    for (int i = 1; i < goal_handle->get_goal()->order; ++i) {
      if (goal_handle->is_canceling()) {
        auto result = std::make_shared<Fibonacci::Result>();
        result->sequence = seq;
        goal_handle->canceled(result);
        RCLCPP_INFO(this->get_logger(), "Goal 취소됨");
        return;
      }
      seq.push_back(seq[i] + seq[i - 1]);
      goal_handle->publish_feedback(feedback);
      std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }

    auto result = std::make_shared<Fibonacci::Result>();
    result->sequence = seq;
    goal_handle->succeed(result);
    RCLCPP_INFO(this->get_logger(), "완료");
  }

  rclcpp_action::Server<Fibonacci>::SharedPtr action_server_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<FibonacciServer>());
  rclcpp::shutdown();
  return 0;
}
```

## 6. Action Client (피보나치)

```cpp
// src/fibonacci_client.cpp
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"
#include "action_tutorials_interfaces/action/fibonacci.hpp"

class FibonacciClient : public rclcpp::Node
{
public:
  using Fibonacci = action_tutorials_interfaces::action::Fibonacci;
  using GoalHandleFibonacci = rclcpp_action::ClientGoalHandle<Fibonacci>;

  FibonacciClient() : Node("fibonacci_client")
  {
    client_ = rclcpp_action::create_client<Fibonacci>(this, "fibonacci");
  }

  void send_goal(int order)
  {
    if (!client_->wait_for_action_server(std::chrono::seconds(5))) {
      RCLCPP_ERROR(this->get_logger(), "액션 서버 없음");
      return;
    }

    auto goal_msg = Fibonacci::Goal();
    goal_msg.order = order;

    auto send_goal_options = rclcpp_action::Client<Fibonacci>::SendGoalOptions();
    send_goal_options.feedback_callback =
      [this](GoalHandleFibonacci::SharedPtr,
        const std::shared_ptr<const Fibonacci::Feedback> feedback) {
        RCLCPP_INFO(this->get_logger(), "피드백: 수열 길이=%zu",
          feedback->partial_sequence.size());
      };
    send_goal_options.result_callback =
      [this](const GoalHandleFibonacci::WrappedResult & result) {
        if (result.code == rclcpp_action::ResultCode::SUCCEEDED) {
          RCLCPP_INFO(this->get_logger(), "완료: 수열 길이=%zu",
            result.result->sequence.size());
        } else {
          RCLCPP_ERROR(this->get_logger(), "Goal 실패");
        }
        rclcpp::shutdown();
      };

    RCLCPP_INFO(this->get_logger(), "Goal 전송: order=%d", order);
    client_->async_send_goal(goal_msg, send_goal_options);
  }

private:
  rclcpp_action::Client<Fibonacci>::SharedPtr client_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  auto node = std::make_shared<FibonacciClient>();
  node->send_goal(10);
  rclcpp::spin(node);
  rclcpp::shutdown();
  return 0;
}
```

## 7. TF2 Broadcaster

```cpp
// src/odom_tf_broadcaster.cpp
#include <cmath>
#include "rclcpp/rclcpp.hpp"
#include "geometry_msgs/msg/transform_stamped.hpp"
#include "tf2_ros/transform_broadcaster.h"

class OdomTFBroadcaster : public rclcpp::Node
{
public:
  OdomTFBroadcaster() : Node("odom_tf_broadcaster"), theta_(0.0)
  {
    tf_broadcaster_ = std::make_unique<tf2_ros::TransformBroadcaster>(*this);
    timer_ = this->create_wall_timer(
      std::chrono::milliseconds(50),  // 20Hz
      std::bind(&OdomTFBroadcaster::broadcast_tf, this));
  }

private:
  void broadcast_tf()
  {
    geometry_msgs::msg::TransformStamped t;
    t.header.stamp = this->get_clock()->now();
    t.header.frame_id = "odom";
    t.child_frame_id = "base_link";

    t.transform.translation.x = std::cos(theta_);
    t.transform.translation.y = std::sin(theta_);
    t.transform.translation.z = 0.0;

    // Yaw만 있는 경우 쿼터니언 변환
    t.transform.rotation.x = 0.0;
    t.transform.rotation.y = 0.0;
    t.transform.rotation.z = std::sin(theta_ / 2.0);
    t.transform.rotation.w = std::cos(theta_ / 2.0);

    tf_broadcaster_->sendTransform(t);
    theta_ += 0.01;
  }

  std::unique_ptr<tf2_ros::TransformBroadcaster> tf_broadcaster_;
  rclcpp::TimerBase::SharedPtr timer_;
  double theta_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<OdomTFBroadcaster>());
  rclcpp::shutdown();
  return 0;
}
```

## 8. TF2 Listener

```cpp
// src/tf2_listener.cpp
#include "rclcpp/rclcpp.hpp"
#include "tf2_ros/buffer.h"
#include "tf2_ros/transform_listener.h"
#include "geometry_msgs/msg/transform_stamped.hpp"

class TF2ListenerNode : public rclcpp::Node
{
public:
  TF2ListenerNode() : Node("tf2_listener")
  {
    tf_buffer_ = std::make_unique<tf2_ros::Buffer>(this->get_clock());
    tf_listener_ = std::make_shared<tf2_ros::TransformListener>(*tf_buffer_, this);
    timer_ = this->create_wall_timer(
      std::chrono::seconds(1),
      std::bind(&TF2ListenerNode::lookup_transform, this));
  }

private:
  void lookup_transform()
  {
    try {
      auto t = tf_buffer_->lookupTransform(
        "map", "base_link", tf2::TimePointZero);
      auto & p = t.transform.translation;
      RCLCPP_INFO(this->get_logger(),
        "map->base_link: pos=(%.2f, %.2f, %.2f)",
        p.x, p.y, p.z);
    } catch (const tf2::TransformException & ex) {
      RCLCPP_WARN(this->get_logger(), "TF 조회 실패: %s", ex.what());
    }
  }

  std::unique_ptr<tf2_ros::Buffer> tf_buffer_;
  std::shared_ptr<tf2_ros::TransformListener> tf_listener_;
  rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<TF2ListenerNode>());
  rclcpp::shutdown();
  return 0;
}
```

## 9. Parameter 선언 + 콜백

```cpp
// src/param_demo.cpp
#include "rclcpp/rclcpp.hpp"
#include "rcl_interfaces/msg/set_parameters_result.hpp"

class ParamDemoNode : public rclcpp::Node
{
public:
  ParamDemoNode() : Node("param_demo_node")
  {
    // 파라미터 선언 (이름, 기본값)
    this->declare_parameter("speed", 1.0);
    this->declare_parameter("robot_name", std::string("my_robot"));
    this->declare_parameter("debug", false);

    // 초기 값 읽기
    speed_ = this->get_parameter("speed").as_double();
    robot_name_ = this->get_parameter("robot_name").as_string();
    debug_ = this->get_parameter("debug").as_bool();

    // 파라미터 변경 콜백 등록
    param_cb_ = this->add_on_set_parameters_callback(
      std::bind(&ParamDemoNode::param_callback, this, std::placeholders::_1));

    RCLCPP_INFO(this->get_logger(), "시작: robot=%s, speed=%.2f",
      robot_name_.c_str(), speed_);

    timer_ = this->create_wall_timer(
      std::chrono::seconds(1),
      std::bind(&ParamDemoNode::run, this));
  }

private:
  rcl_interfaces::msg::SetParametersResult param_callback(
    const std::vector<rclcpp::Parameter> & params)
  {
    rcl_interfaces::msg::SetParametersResult result;
    result.successful = true;

    for (const auto & p : params) {
      if (p.get_name() == "speed") {
        double val = p.as_double();
        if (val < 0.0 || val > 3.0) {
          result.successful = false;
          result.reason = "속도는 0.0 ~ 3.0 범위여야 합니다";
          return result;
        }
        speed_ = val;
        RCLCPP_INFO(this->get_logger(), "속도 변경: %.2f", speed_);
      } else if (p.get_name() == "robot_name") {
        robot_name_ = p.as_string();
      } else if (p.get_name() == "debug") {
        debug_ = p.as_bool();
      }
    }
    return result;
  }

  void run()
  {
    if (debug_) {
      RCLCPP_DEBUG(this->get_logger(), "[DEBUG] robot=%s, speed=%.2f",
        robot_name_.c_str(), speed_);
    }
    RCLCPP_INFO(this->get_logger(), "동작 중: speed=%.2f", speed_);
  }

  rclcpp::TimerBase::SharedPtr timer_;
  rclcpp::node_interfaces::OnSetParametersCallbackHandle::SharedPtr param_cb_;
  double speed_;
  std::string robot_name_;
  bool debug_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<ParamDemoNode>());
  rclcpp::shutdown();
  return 0;
}
```

## 10. 멀티 스레드 Executor

```cpp
// src/multi_thread_node.cpp
#include "rclcpp/rclcpp.hpp"
#include "std_srvs/srv/trigger.hpp"

class MultiThreadNode : public rclcpp::Node
{
public:
  MultiThreadNode() : Node("multi_thread_node")
  {
    // ReentrantCallbackGroup: 동시 실행 허용
    reentrant_group_ = this->create_callback_group(
      rclcpp::CallbackGroupType::Reentrant);
    // MutuallyExclusive: 동시 실행 금지
    exclusive_group_ = this->create_callback_group(
      rclcpp::CallbackGroupType::MutuallyExclusive);

    // 빠른 타이머 (10Hz)
    fast_timer_ = this->create_wall_timer(
      std::chrono::milliseconds(100),
      std::bind(&MultiThreadNode::fast_callback, this),
      reentrant_group_);

    // 느린 타이머 (1Hz)
    slow_timer_ = this->create_wall_timer(
      std::chrono::seconds(1),
      std::bind(&MultiThreadNode::slow_callback, this),
      exclusive_group_);

    // 서비스 서버
    service_ = this->create_service<std_srvs::srv::Trigger>(
      "trigger",
      std::bind(&MultiThreadNode::service_callback, this,
        std::placeholders::_1, std::placeholders::_2),
      rmw_qos_profile_services_default,
      reentrant_group_);
  }

private:
  void fast_callback()
  {
    RCLCPP_DEBUG(this->get_logger(), "빠른 콜백 실행");
  }

  void slow_callback()
  {
    RCLCPP_INFO(this->get_logger(), "느린 콜백 실행");
  }

  void service_callback(
    const std::shared_ptr<std_srvs::srv::Trigger::Request>,
    std::shared_ptr<std_srvs::srv::Trigger::Response> response)
  {
    RCLCPP_INFO(this->get_logger(), "서비스 처리 중...");
    std::this_thread::sleep_for(std::chrono::seconds(2));  // 긴 작업 시뮬레이션
    response->success = true;
    response->message = "완료";
  }

  rclcpp::CallbackGroup::SharedPtr reentrant_group_;
  rclcpp::CallbackGroup::SharedPtr exclusive_group_;
  rclcpp::TimerBase::SharedPtr fast_timer_;
  rclcpp::TimerBase::SharedPtr slow_timer_;
  rclcpp::Service<std_srvs::srv::Trigger>::SharedPtr service_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  auto node = std::make_shared<MultiThreadNode>();
  rclcpp::executors::MultiThreadedExecutor executor(
    rclcpp::ExecutorOptions(), 4);  // 4 스레드
  executor.add_node(node);
  executor.spin();
  rclcpp::shutdown();
  return 0;
}
```

## 11. LaserScan 구독 + 처리

```cpp
// src/lidar_processor.cpp
#include <limits>
#include <algorithm>
#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/laser_scan.hpp"

class LidarProcessor : public rclcpp::Node
{
public:
  LidarProcessor() : Node("lidar_processor")
  {
    // 센서 데이터는 BEST_EFFORT QoS 사용
    auto qos = rclcpp::SensorDataQoS();
    subscription_ = this->create_subscription<sensor_msgs::msg::LaserScan>(
      "/scan", qos,
      std::bind(&LidarProcessor::scan_callback, this, std::placeholders::_1));
    RCLCPP_INFO(this->get_logger(), "LiDAR 처리기 시작: /scan 구독 중");
  }

private:
  void scan_callback(const sensor_msgs::msg::LaserScan & msg)
  {
    float range_min = msg.range_min;
    float range_max = msg.range_max;

    // 유효한 거리 값만 필터링
    std::vector<float> valid_ranges;
    for (const auto & r : msg.ranges) {
      if (r > range_min && r < range_max) {
        valid_ranges.push_back(r);
      }
    }

    if (valid_ranges.empty()) return;

    float min_dist = *std::min_element(valid_ranges.begin(), valid_ranges.end());
    float max_dist = *std::max_element(valid_ranges.begin(), valid_ranges.end());
    float avg_dist = std::accumulate(valid_ranges.begin(), valid_ranges.end(), 0.0f)
                     / static_cast<float>(valid_ranges.size());

    RCLCPP_INFO(this->get_logger(),
      "포인트: %zu, 유효: %zu | 최소: %.2fm, 최대: %.2fm, 평균: %.2fm",
      msg.ranges.size(), valid_ranges.size(), min_dist, max_dist, avg_dist);

    // 정면 장애물 감지 (±10 인덱스)
    size_t center = msg.ranges.size() / 2;
    size_t front_range = 10;
    float front_min = std::numeric_limits<float>::infinity();

    for (size_t i = center - front_range; i <= center + front_range; ++i) {
      float r = msg.ranges[i];
      if (r > range_min && r < range_max) {
        front_min = std::min(front_min, r);
      }
    }

    if (front_min < 0.5f) {
      RCLCPP_WARN(this->get_logger(), "전방 장애물 감지: %.2fm", front_min);
    }
  }

  rclcpp::Subscription<sensor_msgs::msg::LaserScan>::SharedPtr subscription_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<LidarProcessor>());
  rclcpp::shutdown();
  return 0;
}
```
