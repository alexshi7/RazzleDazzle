import { useEffect } from 'react';
import { buildSketchHtml } from '../utils/buildSketchHtml';

export function useIframeSketch(code, iframeRef) {
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (!code) {
      iframe.srcdoc = '';
      return;
    }
    iframe.srcdoc = buildSketchHtml(code);
    return () => {
      if (iframeRef.current) iframeRef.current.srcdoc = '';
    };
  }, [code]);
}
