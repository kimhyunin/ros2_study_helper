import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "ROS2 Humble 학습 도우미",
  description: "나만의 ROS2 Humble 학습 노트",
  lang: 'ko-KR',
  base: '/ros2_study_helper/',

  appearance: 'dark',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c8772' }],
  ],

  themeConfig: {
    logo: '🤖',
    siteTitle: 'ROS2 Humble 학습 도우미',

    nav: [
      { text: '홈', link: '/' },
      { text: '치트시트', link: '/cheatsheet/' },
      { text: '핵심 개념', link: '/concepts/nodes' },
      { text: '템플릿', link: '/templates/package-structure' },
      { text: '스니펫', link: '/snippets/' },
      { text: '체크리스트', link: '/checklist/' },
    ],

    sidebar: [
      {
        text: '홈',
        items: [
          { text: '소개', link: '/' },
        ]
      },
      {
        text: '치트시트',
        collapsed: false,
        items: [
          { text: 'ROS2 명령어', link: '/cheatsheet/' },
          { text: 'CLI 도구', link: '/cheatsheet/cli-tools' },
        ]
      },
      {
        text: '핵심 개념',
        collapsed: false,
        items: [
          { text: 'Node', link: '/concepts/nodes' },
          { text: 'Topic', link: '/concepts/topics' },
          { text: 'Service', link: '/concepts/services' },
          { text: 'Action', link: '/concepts/actions' },
          { text: 'TF2', link: '/concepts/tf2' },
          { text: 'Parameters', link: '/concepts/parameters' },
          { text: 'Launch 파일', link: '/concepts/launch' },
        ]
      },
      {
        text: '패키지 & 템플릿',
        collapsed: false,
        items: [
          { text: '패키지 구조', link: '/templates/package-structure' },
          { text: 'Launch 파일 템플릿', link: '/templates/launch-files' },
        ]
      },
      {
        text: '코드 스니펫',
        collapsed: false,
        items: [
          { text: 'Python (rclpy)', link: '/snippets/' },
          { text: 'C++ (rclcpp)', link: '/snippets/cpp' },
        ]
      },
      {
        text: '학습 체크리스트',
        items: [
          { text: '체크리스트', link: '/checklist/' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/ros2-study-helper' }
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '검색',
                buttonAriaLabel: '검색'
              },
              modal: {
                noResultsText: '결과를 찾을 수 없습니다',
                resetButtonTitle: '검색어 초기화',
                footer: {
                  selectText: '선택',
                  navigateText: '탐색',
                  closeText: '닫기'
                }
              }
            }
          }
        }
      }
    },

    footer: {
      message: 'ROS2 Humble 개인 학습 노트',
      copyright: 'Copyright © 2024'
    },

    editLink: {
      pattern: 'https://github.com/your-username/ros2-study-helper/edit/main/docs/:path',
      text: '이 페이지 편집하기'
    },

    lastUpdated: {
      text: '마지막 업데이트',
    },

    outline: {
      label: '목차',
      level: [2, 3]
    },

    docFooter: {
      prev: '이전',
      next: '다음'
    },

    darkModeSwitchLabel: '테마',
    lightModeSwitchTitle: '라이트 모드로 전환',
    darkModeSwitchTitle: '다크 모드로 전환',
    sidebarMenuLabel: '메뉴',
    returnToTopLabel: '맨 위로',
  }
})
