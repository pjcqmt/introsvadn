'use client';

export default function PraderWilliPage() {
  return (
    <>
      <style jsx>{`
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 20px;
          background-color: #f8f9fa;
        }
        
        h2 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 30px;
          font-size: 24px;
        }
        
        .table-container {
          overflow-x: auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          padding: 20px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          margin: 0 auto;
        }
        
        th {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
          color: white;
          padding: 15px 12px;
          text-align: center;
          font-weight: 600;
          font-size: 13px;
          border: 1px solid #ddd;
        }
        
        th:first-child {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          width: 140px;
          text-align: left;
        }
        
        td {
          padding: 12px;
          border: 1px solid #ddd;
          text-align: center;
          vertical-align: middle;
          line-height: 1.4;
        }
        
        td:first-child {
          background-color: #f8f9fa;
          font-weight: 600;
          text-align: left;
          color: #2c3e50;
        }
        
        /* Styles pour les différents types de résultats */
        .normal {
          background-color: #d4edda;
          color: #155724;
          font-weight: 600;
        }
        
        .abnormal {
          background-color: #f8d7da;
          color: #721c24;
          font-weight: 600;
        }
        
        .warning {
          background-color: #fff3cd;
          color: #856404;
          font-weight: 600;
        }
        
        .biparental {
          background-color: #e7f3ff;
          color: #004085;
          font-weight: 600;
        }
        
        .maternal {
          background-color: #fce4ec;
          color: #880e4f;
          font-weight: 600;
        }
        
        .diagnostic {
          font-style: italic;
          font-weight: 600;
          font-size: 12px;
        }
        
        .legend {
          margin-top: 20px;
          padding: 15px;
          background-color: #e9ecef;
          border-radius: 8px;
          font-size: 12px;
          color: #495057;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          table {
            font-size: 12px;
          }
          
          th, td {
            padding: 8px 6px;
          }
          
          th:first-child {
            width: 100px;
          }
        }
      `}</style>
      
      <h2>🧬 Tableau diagnostic différentiel rapide - Syndrome de Prader-Willi</h2>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Critère</th>
              <th>CAS 1<br/><strong>Délétion paternelle</strong></th>
              <th>CAS 2<br/><strong>UPD maternelle</strong></th>
              <th>CAS 3<br/><strong>Défaut d'empreinte</strong></th>
              <th>CAS 4<br/><strong>Translocation</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>🧬 <strong>Southern blot</strong></td>
              <td className="warning">⚠️ 50% intensité<br/>❌ Méthylation absente</td>
              <td className="normal">✅ NORMAL<br/>Dosage conservé</td>
              <td className="normal">✅ NORMAL<br/>Dosage conservé</td>
              <td className="warning">⚠️ Intensité variable<br/>❌ Méthylation absente</td>
            </tr>
            <tr>
              <td>📊 <strong>Microsatellites RC</strong></td>
              <td className="maternal">👩<br/>MATERNEL seul</td>
              <td className="maternal">👩<br/>MATERNEL seul</td>
              <td className="biparental">👨+👩<br/>BIPARENTAL</td>
              <td className="maternal">👩<br/>MATERNEL seul</td>
            </tr>
            <tr>
              <td>📊 <strong>Microsatellites HRC</strong></td>
              <td className="biparental">👨+👩<br/>BIPARENTAL</td>
              <td className="maternal">👩<br/>MATERNEL seul</td>
              <td className="biparental">👨+👩<br/>BIPARENTAL</td>
              <td className="biparental">👨+👩<br/>BIPARENTAL</td>
            </tr>
            <tr>
              <td>🔍 <strong>Mécanisme</strong></td>
              <td>Perte physique<br/><strong>région paternelle</strong></td>
              <td>Pas d'allèle<br/><strong>paternel</strong></td>
              <td>Allèles présents<br/><strong>empreinte défaillante</strong></td>
              <td>Rupture chromosomique<br/><strong>région critique</strong></td>
            </tr>
            <tr>
              <td>⚡ <strong>Diagnostic rapide</strong></td>
              <td className="diagnostic">Intensité réduite<br/>+ Pas paternel RC</td>
              <td className="diagnostic">Méthylation 100%<br/>+ Tout maternel</td>
              <td className="diagnostic">Méthylation 100%<br/>+ Microsats ✅</td>
              <td className="diagnostic">FISH anormale<br/>+ Pas paternel RC</td>
            </tr>

          </tbody>
        </table>
        
        <div className="legend">
          <strong>Légende :</strong> RC = Région critique (15q11-q13) | HRC = Hors région critique | 
          👨 = Allèle paternel | 👩 = Allèle maternel | 
          ✅ = Normal | ❌ = Anormal | ⚠️ = Attention | FISH = Hybridation in situ fluorescente
          <br/><strong>Note :</strong> Contrairement à Angelman, Prader-Willi affecte l'expression des gènes <em>paternels</em> dans la région 15q11-q13
        </div>
      </div>
    </>
  );
} 