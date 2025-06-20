'use client';

export default function TransmissionGenetiquePage() {
  return (
    <>
      <style jsx>{`
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          backdrop-filter: blur(10px);
        }
        
        h1 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 30px;
          font-size: 2.5em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .table-container {
          overflow-x: auto;
          margin: 20px 0;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 10px;
          overflow: hidden;
        }
        
        th {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 1.1em;
        }
        
        td {
          padding: 12px;
          border-bottom: 1px solid #ecf0f1;
          vertical-align: top;
        }
        
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        tr:hover {
          background-color: #e3f2fd;
          transition: background-color 0.3s ease;
        }
        
        .trait-type {
          font-weight: bold;
          color: #2c3e50;
          font-size: 1.1em;
        }
        
        .dominant {
          color: #e74c3c;
          font-weight: bold;
        }
        
        .recessive {
          color: #3498db;
          font-weight: bold;
        }
        
        .x-linked {
          color: #9b59b6;
          font-weight: bold;
        }
        
        .genotype {
          font-family: 'Courier New', monospace;
          background: #ecf0f1;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
        }
        
        .phenotype {
          font-style: italic;
          color: #2c3e50;
        }
        
        .example-box {
          background: linear-gradient(135deg, #74b9ff, #0984e3);
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .example-title {
          font-size: 1.3em;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .probability-box {
          background: #f1f2f6;
          padding: 15px;
          border-radius: 8px;
          margin: 10px 0;
          border-left: 4px solid #3498db;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 15px;
          }
          
          h1 {
            font-size: 2em;
          }
          
          th, td {
            padding: 8px 6px;
            font-size: 0.9em;
          }
        }
      `}</style>
      
      <div className="container">
        <h1>🧬 Types de transmission génétique</h1>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type de transmission</th>
                <th>Localisation</th>
                <th>Allèles</th>
                <th>Génotypes possibles</th>
                <th>Phénotypes</th>
                <th>Probabilité d'expression</th>
                <th>Exemples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="trait-type dominant">Autosomique Dominante</td>
                <td>Chromosomes autosomes (1-22)</td>
                <td>
                  <span className="genotype">A</span> = dominant<br/>
                  <span className="genotype">a</span> = récessif
                </td>
                <td>
                  <span className="genotype">AA</span> - Homozygote dominant<br/>
                  <span className="genotype">Aa</span> - Hétérozygote<br/>
                  <span className="genotype">aa</span> - Homozygote récessif
                </td>
                <td>
                  <span className="phenotype">AA</span> → Trait exprimé<br/>
                  <span className="phenotype">Aa</span> → Trait exprimé<br/>
                  <span className="phenotype">aa</span> → Trait absent
                </td>
                <td>
                  <div className="probability-box">
                    Croisement Aa × Aa :<br/>
                    • 75% trait exprimé<br/>
                    • 25% trait absent
                  </div>
                </td>
                <td>
                  • Achondroplasie<br/>
                  • Maladie de Huntington<br/>
                  • Polydactylie
                </td>
              </tr>
              
              <tr>
                <td className="trait-type recessive">Autosomique Récessive</td>
                <td>Chromosomes autosomes (1-22)</td>
                <td>
                  <span className="genotype">R</span> = dominant<br/>
                  <span className="genotype">r</span> = récessif
                </td>
                <td>
                  <span className="genotype">RR</span> - Homozygote dominant<br/>
                  <span className="genotype">Rr</span> - Hétérozygote (porteur)<br/>
                  <span className="genotype">rr</span> - Homozygote récessif
                </td>
                <td>
                  <span className="phenotype">RR</span> → Trait absent<br/>
                  <span className="phenotype">Rr</span> → Trait absent (porteur)<br/>
                  <span className="phenotype">rr</span> → Trait exprimé
                </td>
                <td>
                  <div className="probability-box">
                    Croisement Rr × Rr :<br/>
                    • 25% trait exprimé<br/>
                    • 75% trait absent<br/>
                    • 50% porteurs
                  </div>
                </td>
                <td>
                  • Cheveux roux<br/>
                  • Mucoviscidose<br/>
                  • Albinisme
                </td>
              </tr>
              
              <tr>
                <td className="trait-type x-linked">Liée au chromosome X (récessive)</td>
                <td>Chromosome X</td>
                <td>
                  <span className="genotype">X<sup>D</sup></span> = dominant (normal)<br/>
                  <span className="genotype">X<sup>d</sup></span> = récessif (trait)
                </td>
                <td>
                  <strong>Femmes :</strong><br/>
                  <span className="genotype">X<sup>D</sup>X<sup>D</sup></span> - Normale<br/>
                  <span className="genotype">X<sup>D</sup>X<sup>d</sup></span> - Porteuse<br/>
                  <span className="genotype">X<sup>d</sup>X<sup>d</sup></span> - Trait exprimé<br/>
                  <strong>Hommes :</strong><br/>
                  <span className="genotype">X<sup>D</sup>Y</span> - Normal<br/>
                  <span className="genotype">X<sup>d</sup>Y</span> - Trait exprimé
                </td>
                <td>
                  <strong>Femmes :</strong><br/>
                  <span className="phenotype">X<sup>D</sup>X<sup>D</sup></span> → Normale<br/>
                  <span className="phenotype">X<sup>D</sup>X<sup>d</sup></span> → Normale<br/>
                  <span className="phenotype">X<sup>d</sup>X<sup>d</sup></span> → Trait exprimé<br/>
                  <strong>Hommes :</strong><br/>
                  <span className="phenotype">X<sup>D</sup>Y</span> → Normal<br/>
                  <span className="phenotype">X<sup>d</sup>Y</span> → Trait exprimé
                </td>
                <td>
                  <div className="probability-box">
                    Croisement X<sup>D</sup>Y × X<sup>D</sup>X<sup>d</sup> :<br/>
                    <strong>Garçons :</strong><br/>
                    • 50% normaux<br/>
                    • 50% trait exprimé<br/>
                    <strong>Filles :</strong><br/>
                    • 50% normales<br/>
                    • 50% porteuses
                  </div>
                </td>
                <td>
                  • Daltonisme<br/>
                  • Hémophilie<br/>
                  • Myopathie de Duchenne
                </td>
              </tr>
              
              <tr>
                <td className="trait-type x-linked">Liée au chromosome X (dominante)</td>
                <td>Chromosome X</td>
                <td>
                  <span className="genotype">X<sup>D</sup></span> = dominant (trait)<br/>
                  <span className="genotype">X<sup>d</sup></span> = récessif (normal)
                </td>
                <td>
                  <strong>Femmes :</strong><br/>
                  <span className="genotype">X<sup>D</sup>X<sup>D</sup></span> - Trait exprimé<br/>
                  <span className="genotype">X<sup>D</sup>X<sup>d</sup></span> - Trait exprimé<br/>
                  <span className="genotype">X<sup>d</sup>X<sup>d</sup></span> - Normale<br/>
                  <strong>Hommes :</strong><br/>
                  <span className="genotype">X<sup>D</sup>Y</span> - Trait exprimé<br/>
                  <span className="genotype">X<sup>d</sup>Y</span> - Normal
                </td>
                <td>
                  Plus de femmes affectées que d'hommes<br/>
                  (les femmes ont 2 chances d'avoir X<sup>D</sup>)
                </td>
                <td>
                  <div className="probability-box">
                    Croisement X<sup>d</sup>Y × X<sup>D</sup>X<sup>d</sup> :<br/>
                    <strong>Garçons :</strong><br/>
                    • 50% trait exprimé<br/>
                    • 50% normaux<br/>
                    <strong>Filles :</strong><br/>
                    • 50% trait exprimé<br/>
                    • 50% normales
                  </div>
                </td>
                <td>
                  • Rachitisme vitamino-résistant<br/>
                  • Syndrome de Rett<br/>
                  • Incontinentia pigmenti
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="example-box">
          <div className="example-title">📚 Points clés à retenir :</div>
          <ul>
            <li><strong>Dominant :</strong> Il suffit d'une copie de l'allèle pour que le trait s'exprime</li>
            <li><strong>Récessif :</strong> Il faut deux copies de l'allèle pour que le trait s'exprime</li>
            <li><strong>Lié à X :</strong> Les hommes n'ont qu'un chromosome X, donc plus facilement affectés par les traits récessifs liés à X</li>
            <li><strong>Porteur :</strong> Possède l'allèle récessif mais ne l'exprime pas (hétérozygote)</li>
          </ul>
        </div>
      </div>
    </>
  );
} 