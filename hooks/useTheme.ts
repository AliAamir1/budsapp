import { colors } from '../components/ui/gluestack-ui-provider/config';
import { useColorScheme } from './useColorScheme';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  
  // For now, we'll only use light theme as requested
  const theme = colors.light;
  
  return {
    colors: theme,
    colorScheme,
    isDark: colorScheme === 'dark',
  };
}; 