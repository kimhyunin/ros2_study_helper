# Launch 파일 템플릿 모음

> 복사해서 바로 사용할 수 있는 Launch 파일 패턴 모음.

## 패턴 1: 기본 단일 Node 실행

```python
# launch/single_node.launch.py

from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_package',
            executable='my_node',
            name='my_node',
            output='screen',
            emulate_tty=True,
        ),
    ])
```

## 패턴 2: 파라미터 파일 로드

```python
# launch/with_params.launch.py

from launch import LaunchDescription
from launch_ros.actions import Node
from launch.substitutions import PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # 패키지 내 config 파일 경로
    params_file = PathJoinSubstitution([
        FindPackageShare('my_package'),
        'config',
        'params.yaml'
    ])

    return LaunchDescription([
        Node(
            package='my_package',
            executable='my_node',
            name='my_node',
            output='screen',
            parameters=[
                params_file,
                {'additional_param': 'value'},  # 추가 파라미터 덮어쓰기
            ],
        ),
    ])
```

## 패턴 3: 여러 Node 동시 실행

```python
# launch/multi_node.launch.py

from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    camera_node = Node(
        package='v4l2_camera',
        executable='v4l2_camera_node',
        name='camera',
        parameters=[{
            'image_size': [640, 480],
            'camera_frame_id': 'camera_link',
        }],
    )

    detector_node = Node(
        package='my_detector',
        executable='object_detector',
        name='object_detector',
        remappings=[
            ('/image_raw', '/camera/image_raw'),
        ],
    )

    rviz_node = Node(
        package='rviz2',
        executable='rviz2',
        name='rviz2',
        arguments=['-d', '/path/to/config.rviz'],
        output='screen',
    )

    return LaunchDescription([
        camera_node,
        detector_node,
        rviz_node,
    ])
```

## 패턴 4: LaunchArgument 활용

```python
# launch/with_args.launch.py

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # 인수 선언
    use_sim_time_arg = DeclareLaunchArgument(
        'use_sim_time',
        default_value='false',
        choices=['true', 'false'],
        description='시뮬레이션 시간 사용 여부'
    )

    robot_name_arg = DeclareLaunchArgument(
        'robot_name',
        default_value='robot1',
        description='로봇 이름'
    )

    map_arg = DeclareLaunchArgument(
        'map',
        default_value=PathJoinSubstitution([
            FindPackageShare('my_package'), 'maps', 'default.yaml'
        ]),
        description='지도 파일 경로'
    )

    # 인수 값 참조
    use_sim_time = LaunchConfiguration('use_sim_time')
    robot_name = LaunchConfiguration('robot_name')
    map_file = LaunchConfiguration('map')

    return LaunchDescription([
        use_sim_time_arg,
        robot_name_arg,
        map_arg,

        Node(
            package='my_package',
            executable='my_node',
            name=robot_name,
            parameters=[{
                'use_sim_time': use_sim_time,
                'robot_name': robot_name,
            }],
            output='screen',
        ),

        Node(
            package='nav2_map_server',
            executable='map_server',
            name='map_server',
            parameters=[{
                'use_sim_time': use_sim_time,
                'yaml_filename': map_file,
            }],
        ),
    ])
```

```bash
# 실행 예시
ros2 launch my_package with_args.launch.py \
  use_sim_time:=true \
  robot_name:=my_robot \
  map:=/home/user/maps/office.yaml
```

## 패턴 5: Namespace 설정

```python
# launch/namespaced.launch.py

from launch import LaunchDescription
from launch.actions import GroupAction, DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node, PushRosNamespace

def generate_launch_description():
    namespace_arg = DeclareLaunchArgument(
        'namespace',
        default_value='robot1',
        description='로봇 네임스페이스'
    )
    namespace = LaunchConfiguration('namespace')

    return LaunchDescription([
        namespace_arg,

        GroupAction([
            PushRosNamespace(namespace),

            Node(
                package='my_package',
                executable='driver_node',
                name='driver',
                output='screen',
            ),

            Node(
                package='my_package',
                executable='controller_node',
                name='controller',
                output='screen',
            ),
        ]),
    ])
```

## 패턴 6: 다른 Launch 파일 포함 (IncludeLaunchDescription)

```python
# launch/full_system.launch.py

from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, DeclareLaunchArgument
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    use_sim_time = LaunchConfiguration('use_sim_time')

    # Navigation2 Launch 포함
    nav2_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('nav2_bringup'),
                'launch',
                'navigation_launch.py'
            ])
        ]),
        launch_arguments={
            'use_sim_time': use_sim_time,
            'params_file': PathJoinSubstitution([
                FindPackageShare('my_package'),
                'config',
                'nav2_params.yaml'
            ]),
        }.items()
    )

    # 로봇 드라이버 Launch 포함
    robot_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('my_robot_bringup'),
                'launch',
                'robot.launch.py'
            ])
        ]),
    )

    return LaunchDescription([
        DeclareLaunchArgument('use_sim_time', default_value='false'),
        robot_launch,
        nav2_launch,
    ])
```

## 패턴 7: 조건부 실행 (OpaqueFunction)

```python
# launch/conditional.launch.py

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, OpaqueFunction
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def create_nodes(context, *args, **kwargs):
    """컨텍스트에서 인수 값을 읽어 동적으로 노드 생성"""
    use_sim = LaunchConfiguration('use_sim').perform(context) == 'true'
    robot_type = LaunchConfiguration('robot_type').perform(context)

    nodes = []

    # 시뮬레이션 여부에 따라 다른 노드 실행
    if use_sim:
        nodes.append(Node(
            package='gazebo_ros',
            executable='spawn_entity.py',
            arguments=['-topic', 'robot_description', '-entity', 'my_robot'],
            output='screen',
        ))
    else:
        nodes.append(Node(
            package=f'{robot_type}_driver',
            executable='driver_node',
            name='hardware_driver',
            output='screen',
        ))

    # 공통 노드
    nodes.append(Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        parameters=[{'use_sim_time': use_sim}],
    ))

    return nodes

def generate_launch_description():
    return LaunchDescription([
        DeclareLaunchArgument('use_sim', default_value='false'),
        DeclareLaunchArgument('robot_type', default_value='turtlebot3'),
        OpaqueFunction(function=create_nodes),
    ])
```

## 패턴 8: Composition (컴포지션)

```python
# launch/composition.launch.py

from launch import LaunchDescription
from launch_ros.actions import ComposableNodeContainer, Node
from launch_ros.descriptions import ComposableNode

def generate_launch_description():
    # 컴포넌트 컨테이너에 여러 노드를 같은 프로세스로 실행
    container = ComposableNodeContainer(
        name='my_container',
        namespace='',
        package='rclcpp_components',
        executable='component_container',
        composable_node_descriptions=[
            ComposableNode(
                package='image_transport',
                plugin='image_transport::CameraSubscriberPlugin',
                name='camera_subscriber',
                parameters=[{'transport': 'raw'}],
            ),
            ComposableNode(
                package='my_package',
                plugin='my_package::ImageProcessorNode',
                name='image_processor',
                remappings=[
                    ('/image_raw', '/camera/image_raw'),
                ],
            ),
        ],
        output='screen',
    )

    return LaunchDescription([container])
```

## 패턴 9: URDF/XACRO 로드

```python
# launch/robot_description.launch.py

import os
import xacro
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare
from launch.substitutions import PathJoinSubstitution

def generate_launch_description():
    pkg_share = FindPackageShare('my_robot_description')

    # XACRO 파일 경로
    xacro_file = PathJoinSubstitution([
        pkg_share, 'urdf', 'robot.urdf.xacro'
    ])

    # XACRO 처리 (OpaqueFunction 사용)
    from launch.actions import OpaqueFunction

    def process_xacro(context):
        xacro_path = xacro_file.perform(context)
        robot_description = xacro.process_file(xacro_path).toxml()

        return [
            Node(
                package='robot_state_publisher',
                executable='robot_state_publisher',
                name='robot_state_publisher',
                parameters=[{'robot_description': robot_description}],
                output='screen',
            )
        ]

    return LaunchDescription([
        OpaqueFunction(function=process_xacro),
    ])
```

::: tip setup.py에 launch 파일 등록
```python
data_files=[
    (os.path.join('share', package_name, 'launch'),
     glob(os.path.join('launch', '*launch.[pxy][yma]*'))),
],
```
glob 패턴이 `.launch.py`, `.launch.xml`, `.launch.yaml`을 모두 포함합니다.
:::
