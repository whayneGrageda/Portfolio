import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@models': path.resolve(__dirname, './src/domain/models'),
      '@viewmodels': path.resolve(__dirname, './src/presentation/viewmodels'),
      '@views': path.resolve(__dirname, './src/presentation/views'),
      '@services': path.resolve(__dirname, './src/infrastructure/services'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
});
