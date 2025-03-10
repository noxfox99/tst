/// <reference lib="webworker" />

self.onmessage = (event: MessageEvent<string>) => {
    const code = event.data;
    try {
      // Simuliere eine einfache Code-Ausführung (sicherer als eval)
      const result = `Code erfolgreich gerendert für: ${code.substring(0, 20)}...`;
      self.postMessage({ message: result, workerData: code });
    } catch (error: any) { // Typisiere error als 'any' oder 'Error'
      self.postMessage({ message: `Fehler bei der Ausführung: ${error instanceof Error ? error.message : String(error)}`, workerData: code });
    }
  };