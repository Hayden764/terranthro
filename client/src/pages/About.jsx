import { Link } from 'react-router-dom';
import styles from './About.module.css';

const About = () => {
  const handleContact = () => {
    window.location.href = 'mailto:hayden@terranthro.com';
  };

  return (
    <div className={styles.scrollContainer}>
      <div className={styles.aboutPage}>
        {/* Back to Map Link */}
        <Link to="/" className={styles.backLink}>
          ← Back to Map
        </Link>
        
        {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.headline}>
            A progressive, multi-scale visualization platform for American wine terroir.
          </h1>
          <p className={styles.subhead}>
            Wine begins in the ground. Understanding it requires seeing at every scale — from continental climate patterns to the slope of a single hillside.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/" className={styles.primaryButton}>
              Explore the Map
            </Link>
            <button 
              className={styles.secondaryButton}
              onClick={handleContact}
            >
              Contact for Consulting
            </button>
          </div>
        </div>
      </section>

      {/* Why Terranthro Exists */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionHeading}>Why Terranthro Exists</h2>
          <div className={styles.bodyText}>
            <p>
              Terroir — the complete natural environment where wine is produced — is fundamentally spatial. It's climate intersecting with geology, elevation shaping temperature, soil drainage following topography. Yet most tools for understanding terroir are either oversimplified consumer maps or inaccessible GIS systems locked behind enterprise software.
            </p>
            <p>
              I built Terranthro to fill that gap: a rigorous, beautiful, freely accessible platform that brings professional-grade terroir analysis to anyone who wants to understand where wine comes from.
            </p>
            <p>
              The name combines <em>terra</em> (earth) and <em>anthropos</em> (human) — because great wine is where cultivation meets geology, where people meet place.
            </p>
          </div>
        </div>
      </section>

      {/* The Data */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionHeading}>The Data</h2>
          <div className={styles.bodyText}>
            <p>
              Terranthro synthesizes authoritative datasets into cohesive visualizations:
            </p>
            <ul className={styles.dataList}>
              <li><strong>Climate:</strong> PRISM Climate Group (Oregon State University)</li>
              <li><strong>Soil:</strong> USDA NRCS Soil Survey (SSURGO)</li>
              <li><strong>Terrain:</strong> USGS 3D Elevation Program (3DEP)</li>
              <li><strong>Boundaries:</strong> TTB American Viticultural Areas, USDA production statistics</li>
            </ul>
            <p>
              Every map uses projections optimized for accuracy: Albers Equal Area for national context, UTM zones with custom rotation for state-level detail.
            </p>
          </div>
        </div>
      </section>

      {/* About the Builder */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionHeading}>About the Builder</h2>
          <div className={styles.bodyText}>
            <p>
              I'm Hayden Smith, a geospatial analyst and cartographer with a BS in Geographic Information Systems. I've spent years working at the intersection of data, design, and wine — building vineyard mapping systems, analyzing microclimates, and helping wineries understand their land.
            </p>
            <p>
              Terranthro grew from recognizing a missing piece: there was no digital, explorable way to see how climate, soil, and topography shape where wine grows. Terroir is fascinating to anyone interested in the land and what it produces — but it existed only in static books or locked behind enterprise software. My background in GIS and viticulture pointed to the solution: build the interactive platform that should exist.
            </p>
            <p>
              So I built what I wanted to exist: a platform where rigorous science meets thoughtful design, where complexity is revealed progressively, where the map itself teaches you how to read it.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <h3 className={styles.footerTitle}>Terranthro</h3>
          <p className={styles.footerTagline}>
            Connecting people with place
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default About;
