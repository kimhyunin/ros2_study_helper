# Launch 파일

## Launch 파일이란?

Launch 파일은 여러 노드를 한 번에 실행하고 구성하는 파이썬 스크립트입니다. ROS2 Humble에서는 Python 형식의 Launch 파일을 주로 사용합니다 (XML, YAML도 지원).

## 기본 구조

```python
# my_package/launch/my_launch.py

from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    """Launch 파일의 진입점. LaunchDescription을 반환해야 함."""
    return LaunchDescription([
        Node(
            package='turtlesim',
            executable='turtlesim_node',
            name='sim',
        ),
        Node(
            package='turtlesim',
            executable='turtle_teleop_key',
            name='teleop',
        ),
    ])
```

## Node 실행 옵션

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_package',          # 패키지 이름
            executable='my_node',          # 실행 파일 이름
            name='custom_node_name',       # 노드 이름 (선택)
            namespace='robot1',            # 네임스페이스 (선택)
            output='screen',               # 로그 출력: 'screen' | 'log' | 'both'
            emulate_tty=True,              # 컬러 출력 활성화
            parameters=[                   # 파라미터
                {'max_speed': 1.5},
                '/path/to/params.yaml',
            ],
            remappings=[                   # 토픽 리매핑
                ('/old_topic', '/new_topic'),
                ('/cmd_vel', '/robot1/cmd_vel'),
            ],
            arguments=['--ros-args', '--log-level', 'debug'],  # 추가 인수
        ),
    ])
```

## LaunchArgument (런타임 인수)

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    # 인수 선언
    use_sim_time_arg = DeclareLaunchArgument(
        'use_sim_time',
        default_value='false',
        description='시뮬레이션 시간 사용 여부'
    )

    robot_name_arg = DeclareLaunchArgument(
        'robot_name',
        default_value='my_robot',
        description='로봇 이름'
    )

    map_file_arg = DeclareLaunchArgument(
        'map',
        default_value='/path/to/map.yaml',
        description='지도 파일 경로'
    )

    # LaunchConfiguration으로 인수 값 참조
    use_sim_time = LaunchConfiguration('use_sim_time')
    robot_name = LaunchConfiguration('robot_name')

    return LaunchDescription([
        use_sim_time_arg,
        robot_name_arg,
        map_file_arg,

        Node(
            package='my_package',
            executable='my_node',
            name=robot_name,            # 인수 값 사용
            parameters=[{
                'use_sim_time': use_sim_time,
                'robot_name': robot_name,
            }],
        ),
    ])
```

### CLI에서 인수 전달

```bash
ros2 launch my_package my_launch.py use_sim_time:=true robot_name:=robot1
```

## IncludeLaunchDescription (다른 Launch 파일 포함)

```python
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # 다른 패키지의 Launch 파일 포함
    nav2_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('nav2_bringup'),
                'launch',
                'navigation_launch.py'
            ])
        ]),
        launch_arguments={
            'use_sim_time': 'true',
            'map': '/path/to/map.yaml',
        }.items()
    )

    return LaunchDescription([
        nav2_launch,
    ])
```

## 파라미터 파일 동적 경로

```python
from launch.substitutions import PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # 패키지 내 파일 경로를 동적으로 찾기
    params_file = PathJoinSubstitution([
        FindPackageShare('my_package'),  # 패키지 설치 경로
        'config',
        'params.yaml'
    ])

    rviz_config = PathJoinSubstitution([
        FindPackageShare('my_package'),
        'rviz',
        'view.rviz'
    ])

    return LaunchDescription([
        Node(
            package='my_package',
            executable='my_node',
            parameters=[params_file],
        ),
        Node(
            package='rviz2',
            executable='rviz2',
            arguments=['-d', rviz_config],
        ),
    ])
```

## OpaqueFunction (조건부 실행)

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, OpaqueFunction
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def launch_setup(context, *args, **kwargs):
    """런타임에 컨텍스트에 접근하여 조건부로 액션 생성"""
    use_sim = LaunchConfiguration('use_sim').perform(context)

    nodes = []

    if use_sim == 'true':
        nodes.append(Node(
            package='gazebo_ros',
            executable='spawn_entity.py',
            name='spawn_robot',
        ))
    else:
        nodes.append(Node(
            package='my_robot_bringup',
            executable='hardware_node',
            name='hardware',
        ))

    return nodes

def generate_launch_description():
    return LaunchDescription([
        DeclareLaunchArgument('use_sim', default_value='false'),
        OpaqueFunction(function=launch_setup),
    ])
```

## GroupAction과 Namespace

```python
from launch import LaunchDescription
from launch.actions import GroupAction
from launch_ros.actions import Node, PushRosNamespace

def generate_launch_description():
    robot1_group = GroupAction([
        PushRosNamespace('robot1'),  # 이 그룹의 모든 노드에 네임스페이스 적용
        Node(
            package='my_package',
            executable='driver_node',
        ),
        Node(
            package='my_package',
            executable='controller_node',
        ),
    ])

    robot2_group = GroupAction([
        PushRosNamespace('robot2'),
        Node(
            package='my_package',
            executable='driver_node',
        ),
    ])

    return LaunchDescription([
        robot1_group,
        robot2_group,
    ])
```

## TimerAction (지연 실행)

```python
from launch import LaunchDescription
from launch.actions import TimerAction
from launch_ros.actions import Node

def generate_launch_description():
    # 즉시 실행
    localization_node = Node(
        package='nav2_map_server',
        executable='map_server',
        name='map_server',
    )

    # 3초 후 실행 (map_server가 준비된 후)
    navigation_node = TimerAction(
        period=3.0,
        actions=[
            Node(
                package='nav2_bt_navigator',
                executable='bt_navigator',
            )
        ]
    )

    return LaunchDescription([
        localization_node,
        navigation_node,
    ])
```

## 이벤트 핸들러

```python
from launch import LaunchDescription
from launch.actions import RegisterEventHandler, LogInfo
from launch.event_handlers import OnProcessExit, OnProcessStart
from launch_ros.actions import Node

def generate_launch_description():
    my_node = Node(
        package='my_package',
        executable='my_node',
    )

    # 노드 종료 시 로그 출력
    on_exit_handler = RegisterEventHandler(
        OnProcessExit(
            target_action=my_node,
            on_exit=[
                LogInfo(msg='my_node가 종료되었습니다!')
            ]
        )
    )

    # 노드 시작 시 다른 노드 실행
    on_start_handler = RegisterEventHandler(
        OnProcessStart(
            target_action=my_node,
            on_start=[
                Node(
                    package='my_package',
                    executable='monitor_node',
                )
            ]
        )
    )

    return LaunchDescription([
        my_node,
        on_exit_handler,
        on_start_handler,
    ])
```

::: tip package.xml에 launch 의존성 추가
Launch 파일을 사용하는 패키지는 `package.xml`에 다음을 추가하세요:
```xml
<exec_depend>launch</exec_depend>
<exec_depend>launch_ros</exec_depend>
```
:::
