import styled from 'styled-components';
import { Logo } from './Logo';

const Brand = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const BrandText = styled.span`
  color: var(--gray-1);
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
`;

export default function LogoBar() {
  return (
    <Brand aria-label="Atlas">
      <Logo size={28} />
      <BrandText>Atlas</BrandText>
    </Brand>
  );
}
