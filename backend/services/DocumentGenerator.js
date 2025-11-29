const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

class DocumentGenerator {
  /**
   * Genera un PDF profesional con datos de diagnóstico, riesgos y roadmap
   * @param {Object} data - Datos de la empresa y análisis
   * @returns {Promise<string>} - URL pública del archivo generado
   */
  static async createPDF(data) {
    const {
      companyName = 'Empresa Sin Nombre',
      companyStage = 'Growth',
      riskLevel = 'Medio',
      complianceScore = 0,
      risks = [],
      roadmap = [],
      generatedAt = new Date()
    } = data;

    // Formatear fecha
    const formattedDate = new Date(generatedAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileName = `reporte_${timestamp}.pdf`;
    const filePath = path.join(__dirname, '../storage/documents', fileName);

    // Asegurar que existe el directorio
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // HTML del reporte con diseño profesional
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Diagnóstico Corporativo</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      color: #333;
      line-height: 1.6;
    }

    .page {
      padding: 40px;
      background: white;
    }

    /* PORTADA */
    .cover {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      text-align: center;
      page-break-after: always;
    }

    .cover h1 {
      font-size: 48px;
      margin-bottom: 20px;
      font-weight: bold;
    }

    .cover h2 {
      font-size: 32px;
      margin-bottom: 40px;
      font-weight: 300;
    }

    .cover .date {
      font-size: 18px;
      opacity: 0.9;
      margin-top: 60px;
    }

    /* CONTENIDO */
    .content {
      page-break-before: always;
    }

    .header {
      border-bottom: 4px solid #3b82f6;
      padding-bottom: 15px;
      margin-bottom: 30px;
    }

    .header h2 {
      color: #1e40af;
      font-size: 28px;
    }

    .section {
      margin-bottom: 40px;
    }

    .section h3 {
      color: #1e40af;
      font-size: 22px;
      margin-bottom: 15px;
      border-left: 4px solid #3b82f6;
      padding-left: 12px;
    }

    /* RESUMEN EJECUTIVO */
    .summary-box {
      background: #f0f9ff;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #bfdbfe;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-label {
      font-weight: bold;
      color: #1e40af;
    }

    .summary-value {
      color: #374151;
    }

    /* TABLAS */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      background: white;
    }

    thead {
      background: #1e40af;
      color: white;
    }

    th {
      padding: 12px;
      text-align: left;
      font-weight: bold;
      font-size: 14px;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }

    tr:hover {
      background: #f9fafb;
    }

    /* BADGES DE RIESGO */
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .badge-alto {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-medio {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-bajo {
      background: #d1fae5;
      color: #065f46;
    }

    /* FOOTER */
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }

    .no-data {
      color: #6b7280;
      font-style: italic;
      padding: 20px;
      text-align: center;
      background: #f9fafb;
      border-radius: 8px;
    }
  </style>
</head>
<body>

  <!-- PORTADA -->
  <div class="cover">
    <h1>REPORTE DE DIAGNÓSTICO CORPORATIVO</h1>
    <h2>${companyName}</h2>
    <div class="date">${formattedDate}</div>
  </div>

  <!-- CONTENIDO -->
  <div class="page content">

    <div class="header">
      <h2>Análisis Integral de Cumplimiento Legal</h2>
    </div>

    <!-- RESUMEN EJECUTIVO -->
    <div class="section">
      <h3>Resumen Ejecutivo</h3>
      <div class="summary-box">
        <div class="summary-item">
          <span class="summary-label">Empresa:</span>
          <span class="summary-value">${companyName}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Etapa:</span>
          <span class="summary-value">${companyStage}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Nivel de Riesgo Global:</span>
          <span class="summary-value"><span class="badge badge-${riskLevel.toLowerCase()}">${riskLevel}</span></span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Puntuación de Cumplimiento:</span>
          <span class="summary-value">${complianceScore}%</span>
        </div>
      </div>
    </div>

    <!-- RIESGOS IDENTIFICADOS -->
    <div class="section">
      <h3>Riesgos Identificados</h3>
      ${risks.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th style="width: 25%">Categoría</th>
              <th style="width: 50%">Descripción</th>
              <th style="width: 25%">Nivel</th>
            </tr>
          </thead>
          <tbody>
            ${risks.map(risk => `
              <tr>
                <td><strong>${risk.category || risk.tipo || 'N/A'}</strong></td>
                <td>${risk.description || risk.descripcion || 'Sin descripción'}</td>
                <td>
                  <span class="badge badge-${(risk.level || risk.nivel || 'medio').toLowerCase()}">
                    ${risk.level || risk.nivel || 'Medio'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <div class="no-data">No se han identificado riesgos en este momento.</div>
      `}
    </div>

  </div>

  <!-- ROADMAP (nueva página) -->
  <div class="page content">

    <div class="section">
      <h3>Plan de Acción (Roadmap)</h3>
      ${roadmap.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th style="width: 15%">Fase</th>
              <th style="width: 50%">Tarea</th>
              <th style="width: 20%">Responsable</th>
              <th style="width: 15%">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${roadmap.map(task => `
              <tr>
                <td><strong>${task.phase || task.fase || 'N/A'}</strong></td>
                <td>${task.task || task.tarea || task.title || 'Sin descripción'}</td>
                <td>${task.responsible || task.responsable || 'No asignado'}</td>
                <td>${task.status || task.estado || 'Pendiente'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <div class="no-data">No hay tareas en el roadmap actualmente.</div>
      `}
    </div>

    <div class="footer">
      <p><strong>LAWBiX</strong> - Sistema de Gestión Legal Empresarial</p>
      <p>Reporte generado automáticamente el ${formattedDate}</p>
    </div>

  </div>

</body>
</html>
    `;

    // Generar PDF con Puppeteer
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px'
        }
      });

      console.log(`✅ PDF generado exitosamente: ${fileName}`);

      // Retornar URL pública
      return `/documents/${fileName}`;

    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      throw new Error(`Error al generar PDF: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = DocumentGenerator;
