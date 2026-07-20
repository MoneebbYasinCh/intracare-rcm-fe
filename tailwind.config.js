/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#084B86',
          light: '#0F7CFF',
          lighter: '#9AC8FF',
          accent: '#0060D3',
          pale: '#5EB7F4',
          muted: 'rgba(8, 75, 134, 0.22)',
        },
        danger: {
          DEFAULT: '#EE0606',
          dark: '#820000',
          accent: '#FF7A58',
          light: 'rgba(255, 122, 88, 0.41)',
          muted: 'rgba(255, 122, 88, 0.31)',
        },
        warning: {
          DEFAULT: '#FF8000',
          light: 'rgba(255, 166, 0, 0.43)',
          subtle: '#FFC300',
          pale: 'rgba(255, 248, 36, 0.54)',
        },
        success: {
          DEFAULT: '#0DBA0D',
          dark: '#006200',
          light: '#71FF71',
          muted: 'rgba(13, 186, 13, 0.21)',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          highlight: '#C9D7E4',
          muted: 'rgba(184, 184, 184, 0.36)',
          light: '#E6E6E6',
          border: '#DDDDDD',
        },
        text: {
          primary: '#161719',
          secondary: '#5F5F5F',
        },
        border: {
          DEFAULT: '#B8B8B8',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        prompt: ['Prompt', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '1.5' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.5' }],
        'lg': ['18px', { lineHeight: '1.4' }],
        'xl': ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        '4xl': ['36px', { lineHeight: '1.2' }],
        'heading-md': ['18px', { lineHeight: '1.4' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        sm: '1px 1px 2px rgba(0, 0, 0, 0.14)',
        md: '2px 2px 4px rgba(0, 0, 0, 0.14)',
        lg: '4px 4px 8px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'gradient-header': 'linear-gradient(81.48deg, #084B86 70.195%, #0F7CFF 106.04%)',
        'gradient-progress': 'linear-gradient(to right, #0F7CFF, #9AC8FF)',
        'gradient-success': 'linear-gradient(to right, #0DBA0D, #71FF71)',
        'gradient-danger': 'linear-gradient(to right, #EE0606, #FF7A58)',
        'gradient-timeline': 'linear-gradient(to right, #5EB7F4 11.538%, #B8B8B8 28.68%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
