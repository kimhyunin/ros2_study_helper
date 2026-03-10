# 패키지 구조 & 템플릿

## Python 패키지 구조 (ament_python)

```
my_py_package/
├── my_py_package/
│   ├── __init__.py
│   ├── my_node.py
│   ├── publisher_node.py
│   └── subscriber_node.py
├── launch/
│   └── my_launch.py
├── config/
│   └── params.yaml
├── resource/
│   └── my_py_package        # 패키지 마커 파일 (빈 파일)
├── test/
│   ├── test_copyright.py
│   ├── test_flake8.py
│   └── test_pep8.py
├── package.xml
├── setup.py
└── setup.cfg
```

### 패키지 생성 명령

```bash
cd ~/ros2_ws/src

# Python 패키지 생성
ros2 pkg create --build-type ament_python my_py_package \
  --dependencies rclpy std_msgs geometry_msgs

# 생성 후 구조 확인
ls my_py_package/
```

## C++ 패키지 구조 (ament_cmake)

```
my_cpp_package/
├── include/
│   └── my_cpp_package/
│       └── my_class.hpp
├── src/
│   ├── my_node.cpp
│   └── my_class.cpp
├── launch/
│   └── my_launch.py
├── config/
│   └── params.yaml
├── test/
│   └── test_my_node.cpp
├── CMakeLists.txt
└── package.xml
```

### C++ 패키지 생성 명령

```bash
ros2 pkg create --build-type ament_cmake my_cpp_package \
  --dependencies rclcpp std_msgs geometry_msgs
```

## package.xml 템플릿

### Python 패키지용

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd"
            schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>my_py_package</name>
  <version>0.0.1</version>
  <description>나의 ROS2 Python 패키지</description>

  <maintainer email="you@example.com">Your Name</maintainer>
  <license>Apache-2.0</license>

  <!-- 빌드 도구 -->
  <buildtool_depend>ament_python</buildtool_depend>

  <!-- 런타임 의존성 -->
  <depend>rclpy</depend>
  <depend>std_msgs</depend>
  <depend>geometry_msgs</depend>
  <depend>sensor_msgs</depend>
  <depend>nav_msgs</depend>

  <!-- Launch 관련 -->
  <exec_depend>launch</exec_depend>
  <exec_depend>launch_ros</exec_depend>

  <!-- 테스트 의존성 -->
  <test_depend>ament_copyright</test_depend>
  <test_depend>ament_flake8</test_depend>
  <test_depend>ament_pep8</test_depend>
  <test_depend>python3-pytest</test_depend>

  <export>
    <build_type>ament_python</build_type>
  </export>
</package>
```

### C++ 패키지용

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd"
            schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>my_cpp_package</name>
  <version>0.0.1</version>
  <description>나의 ROS2 C++ 패키지</description>

  <maintainer email="you@example.com">Your Name</maintainer>
  <license>Apache-2.0</license>

  <!-- 빌드 도구 -->
  <buildtool_depend>ament_cmake</buildtool_depend>

  <!-- 빌드 + 런타임 의존성 -->
  <depend>rclcpp</depend>
  <depend>std_msgs</depend>
  <depend>geometry_msgs</depend>
  <depend>sensor_msgs</depend>

  <!-- 빌드 전용 의존성 -->
  <build_depend>rosidl_default_generators</build_depend>

  <!-- 런타임 전용 의존성 -->
  <exec_depend>rosidl_default_runtime</exec_depend>

  <!-- 테스트 의존성 -->
  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

## CMakeLists.txt 템플릿 (C++)

```cmake
cmake_minimum_required(VERSION 3.8)
project(my_cpp_package)

# C++17 표준 사용
if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# 의존성 찾기
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(sensor_msgs REQUIRED)

# 헤더 파일 포함 경로
include_directories(include)

# 실행 파일 생성
add_executable(my_node src/my_node.cpp)

# 의존성 링크
ament_target_dependencies(my_node
  rclcpp
  std_msgs
  geometry_msgs
)

# 설치 규칙
install(TARGETS
  my_node
  DESTINATION lib/${PROJECT_NAME}
)

# Launch 파일 설치
install(DIRECTORY
  launch
  config
  DESTINATION share/${PROJECT_NAME}
)

# 헤더 파일 설치
install(DIRECTORY include/
  DESTINATION include
)

# 테스트
if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()
```

### 커스텀 메시지/서비스 포함 시 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.8)
project(my_interface_package)

find_package(ament_cmake REQUIRED)
find_package(rosidl_default_generators REQUIRED)
find_package(std_msgs REQUIRED)
find_package(geometry_msgs REQUIRED)

# 인터페이스 생성
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/MyCustomMsg.msg"
  "srv/MyCustomSrv.srv"
  "action/MyCustomAction.action"
  DEPENDENCIES std_msgs geometry_msgs
)

ament_export_dependencies(rosidl_default_runtime)
ament_package()
```

## setup.py 템플릿 (Python)

```python
from setuptools import find_packages, setup
import os
from glob import glob

package_name = 'my_py_package'

setup(
    name=package_name,
    version='0.0.1',
    packages=find_packages(exclude=['test']),
    data_files=[
        # 패키지 마커
        ('share/ament_index/resource_index/packages',
         ['resource/' + package_name]),
        # package.xml
        ('share/' + package_name, ['package.xml']),
        # Launch 파일
        (os.path.join('share', package_name, 'launch'),
         glob(os.path.join('launch', '*launch.[pxy][yma]*'))),
        # Config 파일
        (os.path.join('share', package_name, 'config'),
         glob(os.path.join('config', '*.yaml'))),
        # RViz 설정
        (os.path.join('share', package_name, 'rviz'),
         glob(os.path.join('rviz', '*.rviz'))),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Your Name',
    maintainer_email='you@example.com',
    description='나의 ROS2 Python 패키지',
    license='Apache-2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            # 'ros2 run에서 사용할 이름' = '패키지.모듈:main함수'
            'my_node = my_py_package.my_node:main',
            'publisher = my_py_package.publisher_node:main',
            'subscriber = my_py_package.subscriber_node:main',
        ],
    },
)
```

## setup.cfg 템플릿 (Python)

```ini
[develop]
script_dir=$base/lib/my_py_package

[install]
install_scripts=$base/lib/my_py_package
```

## config/params.yaml 템플릿

```yaml
my_node:
  ros__parameters:
    # 기본 설정
    robot_name: "my_robot"
    debug_mode: false

    # 속도 설정
    max_linear_speed: 1.0    # m/s
    max_angular_speed: 1.57  # rad/s (~90도/s)

    # PID 게인
    pid:
      kp: 1.0
      ki: 0.1
      kd: 0.01

    # 토픽 이름
    topics:
      cmd_vel: "/cmd_vel"
      odom: "/odom"
      scan: "/scan"

    # 웨이포인트
    waypoints: [0.0, 0.0, 1.0, 0.0, 1.0, 1.0]
```

::: tip 빌드 후 환경 소싱
```bash
cd ~/ros2_ws
colcon build --symlink-install --packages-select my_py_package
source install/setup.bash
ros2 run my_py_package my_node
```
:::
