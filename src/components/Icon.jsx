const paths = {
  home: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  building: 'M4 21V3h11v18M15 9h5v12M8 7h3M8 11h3M8 15h3M4 21h17',
  hammer: 'M14 4l6 6-3 3-6-6zM11 7L3 15l3 3 8-8M15 3l2-1 5 5-1 2',
  plus: 'M3 20h18M5 20V9l7-5 7 5v11M12 10v6M9 13h6',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 4.5 9-4.5',
  roof: 'M2 13L12 4l10 9M5 11v9h14v-9M9 20v-5h6v5',
  stairs: 'M3 20h5v-4h4v-4h4V8h5M3 20h18',
  bath: 'M3 12h18v3a5 5 0 01-5 5H8a5 5 0 01-5-5zM6 12V6a2 2 0 014 0M7 20l-1 2M17 20l1 2',
  phone: 'M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  check: 'M4 12l5 5L20 6',
  pin: 'M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12zM12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M8.5 12l2.5 2.5 4.5-5'
};

export default function Icon({ name, size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name] || paths.check} />
    </svg>
  );
}
