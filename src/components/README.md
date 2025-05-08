# InertiaFit Responsive Components

This directory contains shared responsive components for use across the InertiaFit application.

## Responsive Components

### ResponsiveContainer

A flexible container component that provides consistent responsive padding and max-width constraints.

```jsx
import ResponsiveContainer from '../components/ResponsiveContainer';

<ResponsiveContainer>
  {/* Your content */}
</ResponsiveContainer>

// With custom props
<ResponsiveContainer 
  maxWidth="max-w-5xl"
  padding="px-6 py-8" 
  className="bg-gray-900"
>
  {/* Your content */}
</ResponsiveContainer>
```

### ResponsiveHeading

A component that provides consistent and responsive typography for headings.

```jsx
import ResponsiveHeading from '../components/ResponsiveHeading';

<ResponsiveHeading level="h1" centered>Welcome to InertiaFit</ResponsiveHeading>

<ResponsiveHeading level="h2" color="text-white">
  Features
</ResponsiveHeading>
```

### ResponsiveCard

A flexible card component with responsive spacing and styling.

```jsx
import ResponsiveCard from '../components/ResponsiveCard';

<ResponsiveCard title="Nutrition Overview">
  {/* Card content */}
</ResponsiveCard>

// With custom props
<ResponsiveCard 
  title="Daily Activity" 
  hover={true}
  bg="bg-gray-700"
>
  {/* Card content */}
</ResponsiveCard>
```

### ResponsiveButton

A flexible button component that provides consistent styling and responsive behavior.

```jsx
import ResponsiveButton from '../components/ResponsiveButton';

<ResponsiveButton onClick={handleClick}>
  Click Me
</ResponsiveButton>

// With custom props
<ResponsiveButton 
  variant="secondary" 
  size="lg" 
  fullWidth={true}
  loading={isLoading}
  onClick={handleSubmit}
>
  Submit
</ResponsiveButton>
```

## Best Practices for Responsive Design

1. **Mobile-First Approach**: Design for mobile screens first, then enhance for larger screens.

2. **Use Responsive Units**: Prefer relative units (rem, em, %) over absolute units (px).

3. **Viewport Meta Tag**: Ensure the viewport meta tag is set correctly in HTML.

4. **Breakpoints**: Use Tailwind's standard breakpoints for consistency:
   - sm: 640px
   - md: 768px
   - lg: 1024px
   - xl: 1280px
   - 2xl: 1536px

5. **Flexbox and Grid**: Use these layouts for responsive content organization.

6. **Media Queries**: Use Tailwind's responsive prefixes (`sm:`, `md:`, etc.) to apply styles at different breakpoints.

7. **Testing**: Test layouts across multiple device sizes. 