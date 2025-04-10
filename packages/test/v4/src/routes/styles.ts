import twMerge from 'tw-merge';

const BUTTON_CLASSES = {
  primary: 'bg-black-200 hover:bg-black-300',
  secondary: 'bg-indigo-200  hover:bg-indigo-300',
  muted: 'hover:bg-slate-50 bg-transparent ',
}

export const getStyles = (variant: keyof typeof BUTTON_CLASSES): string => 
twMerge(
  'px-8 py-4 rounded-full invalid-class transition-all hover:scale-[0.975]',
  BUTTON_CLASSES[variant]
);
