interface Props {
  size?: number;
  color?: string;
}

export const Logo = (props: Props) => {
  const { color, size = 30 } = props;
  const red = color || 'var(--atlas-red)';
  const blue = color || 'var(--atlas-blue)';
  return (
    <svg
      style={{ width: size, height: 'auto' }}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
    >
      <rect width="64" height="64" fill={red} />
      <path d="M28 0H36V64H28V0Z" fill="white" />
      <path d="M0 28H64V36H0V28Z" fill="white" />
      <rect x="16" y="16" width="32" height="32" fill="white" />
      <rect x="24" y="24" width="16" height="16" fill={blue} />
    </svg>
  );
};
