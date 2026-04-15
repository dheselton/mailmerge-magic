import clipboardUrl from '@/assets/openmoji/1F4CB.svg';
import calendarUrl from '@/assets/openmoji/1F4C5.svg';
import checkUrl from '@/assets/openmoji/2705.svg';
import wavingHandUrl from '@/assets/openmoji/1F44B.svg';
import newspaperUrl from '@/assets/openmoji/1F4F0.svg';
import starUrl from '@/assets/openmoji/2B50.svg';
import envelopeUrl from '@/assets/openmoji/2709.svg';
import sparklesUrl from '@/assets/openmoji/2728.svg';
import pencilUrl from '@/assets/openmoji/270F.svg';

export type OpenMojiName =
  | 'clipboard'
  | 'calendar'
  | 'check'
  | 'wavingHand'
  | 'newspaper'
  | 'star'
  | 'envelope'
  | 'sparkles'
  | 'pencil';

const ICONS: Record<OpenMojiName, string> = {
  clipboard: clipboardUrl,
  calendar: calendarUrl,
  check: checkUrl,
  wavingHand: wavingHandUrl,
  newspaper: newspaperUrl,
  star: starUrl,
  envelope: envelopeUrl,
  sparkles: sparklesUrl,
  pencil: pencilUrl,
};

export function OpenMojiIcon(props: { name: OpenMojiName; size?: number; className?: string; alt?: string }) {
  const { name, size = 24, className, alt } = props;
  const src = ICONS[name];
  return (
    <img
      src={src}
      width={size}
      height={size}
      className={className}
      alt={alt ?? name}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

