/**
 * AIParser.js
 * Utility to parse structured AI text summaries into sections.
 */

export const parseAISummary = (text) => {
    if (!text || typeof text !== 'string') {
        return { summary: '', insights: [], actions: [] };
    }
  
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const result = {
      summary: '',
      insights: [],
      actions: []
    };
  
    let currentSection = 'summary';
  
    lines.forEach(line => {
      const upperLine = line.toUpperCase();
      
      // Check for section headers
      if (upperLine.includes('CURRENT SECURITY POSTURE') || upperLine.includes('EXECUTIVE SUMMARY')) {
        currentSection = 'summary';
        return;
      } else if (upperLine.includes('OPERATIONAL INSIGHTS') || upperLine.includes('KEY INSIGHTS')) {
        currentSection = 'insights';
        return;
      } else if (upperLine.includes('MANDATORY ACTION') || upperLine.includes('ACTION ITEMS')) {
        currentSection = 'actions';
        return;
      }
  
      // Parse content based on current section
      if (currentSection === 'summary') {
        result.summary += (result.summary ? ' ' : '') + line;
      } else if (currentSection === 'insights') {
        if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
          result.insights.push(line.replace(/^[-•*]\s*/, ''));
        } else if (line.match(/^\d+\./)) { // Handle "1. ", "2. "
          result.insights.push(line.replace(/^\d+\.\s*/, ''));
        }
      } else if (currentSection === 'actions') {
        if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
          result.actions.push(line.replace(/^[-•*]\s*/, ''));
        } else if (line.match(/^\d+\./)) {
          result.actions.push(line.replace(/^\d+\.\s*/, ''));
        }
      }
    });
  
    return result;
  };
