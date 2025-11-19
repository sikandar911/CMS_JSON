/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      container: {
        padding: {
          DEFAULT: '1rem',
        },
      },
      colors: {
        'primary': '#045D5E',
        'primary-br': '#1C3F3A',
        'primary-800': '#367D73',
        'primary-600': '#689E9E',
        'primary-400': '#9BBEBF',
        'primary-200': '#CDDFDF',
        'primary-100': '#e6efef',
        'secondary': '#FC7300',
        'secondary-800': '#FD8F33',
        'secondary-600': '#FDAB66',
        'secondary-400': '#FEC799',
        'secondary-200': '#FEE3CC',
        'default': '#252525',
        'default-800': '#515151',
        'default-600': '#7C7C7C',
        'default-400': '#A8A8A8',
        'default-200': '#D3D3D3',
        'default-alt': '#101010',
        'natural': '#E9E9E9',
        'natural-800': '#E5EAF4',
        'natural-600': '#ECEFF7',
        'natural-400': '#F2F5F9',
        'natural-200': '#F9FAFC',
        'natural-alt': '#F9F3EF',
        'warning': '#F95555',
        'success': '#2FC86F',
        'link-blue': '#0025E7',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#374151',
            '[class~="lead"]': {
              color: '#4b5563',
            },
            a: {
              color: '#2563eb',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            strong: {
              color: '#111827',
              fontWeight: '600',
            },
            'ol > li::marker': {
              fontWeight: '600',
              color: '#374151',
            },
            'ul > li::marker': {
              backgroundColor: '#d1d5db',
            },
            hr: {
              borderColor: '#e5e7eb',
              borderTopWidth: 1,
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: '#111827',
              borderLeftWidth: '0.25rem',
              borderLeftColor: '#e5e7eb',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
            },
            h1: {
              color: '#111827',
              fontWeight: '800',
            },
            h2: {
              color: '#111827',
              fontWeight: '700',
            },
            h3: {
              color: '#111827',
              fontWeight: '600',
            },
            h4: {
              color: '#111827',
              fontWeight: '600',
            },
            'figure figcaption': {
              color: '#6b7280',
            },
            code: {
              color: '#111827',
              fontWeight: '600',
            },
            'a code': {
              color: '#111827',
            },
            pre: {
              color: '#e5e7eb',
              backgroundColor: '#1f2937',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: '400',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
            },
            'pre code:before': {
              content: 'none',
            },
            'pre code:after': {
              content: 'none',
            },
            table: {
              width: '100%',
              tableLayout: 'auto',
              textAlign: 'left',
              marginTop: '2em',
              marginBottom: '2em',
            },
            thead: {
              color: '#111827',
              fontWeight: '600',
              borderBottomWidth: '1px',
              borderBottomColor: '#d1d5db',
            },
            'thead th': {
              verticalAlign: 'bottom',
              paddingRight: '8px',
              paddingBottom: '8px',
              paddingLeft: '8px',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: '#e5e7eb',
            },
            'tbody tr:last-child': {
              borderBottomWidth: '0',
            },
            'tbody td': {
              verticalAlign: 'top',
              paddingTop: '8px',
              paddingRight: '8px',
              paddingBottom: '8px',
              paddingLeft: '8px',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}