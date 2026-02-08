import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface DebugConfig {
  filename?: string;
  subfolder?: string;
}

export function createDebug(conf: DebugConfig = {}) {
  const tmp = os.tmpdir(); // Mais compatível (Windows/Linux/Mac)
  const subfolder = conf.subfolder || 'debug-to-tmp';
  
  const now = () => {
    const d = new Date();
    return d.toISOString().replace(/[:.]/g, '-');
  };

  const filename = conf.filename || `${now()}.log`;
  const logDir = path.join(tmp, subfolder);
  const logPath = path.join(logDir, filename);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Retorna a função de log
  return (message: string) => {
    try {
      const timestamp = new Date().toISOString();
      fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    } catch (e) {
      // Falha silenciosa para não quebrar o tsserver
    }
  };
}

// Export default para compatibilidade com importação simples
export default createDebug;