import React, { useRef } from 'react';

const ArabiyyaCertificateFinal = ({
    studentName = "ISMI FAMILYEV",
    completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    verificationId = `AP-${Math.floor(Math.random() * 90000000) + 10000000}`,
    certificateType = "Certified Arabic Language Specialist",
    programDescription = "Successfully completed the 7-Level Professional Program at Arabiyya Pro",
    innerRef
}) => {
    return (
        <div ref={innerRef} style={styles.wrapper} className="certificate-node">
            <div style={styles.container}>
                {/* Decorative Elements */}
                <div style={styles.waveOverlay}></div>
                <div style={styles.curveDecoration}>
                    <div style={{ ...styles.curve, ...styles.curveTop }}></div>
                    <div style={{ ...styles.curve, ...styles.curveBottom }}></div>
                </div>

                {/* Main Content */}
                <div style={styles.content}>
                    {/* Logo */}
                    <div style={styles.logoSection}>
                        <div style={styles.logoIcon}>⚡</div>
                        <div style={styles.brandTitle}>ARABIYYA PRO</div>
                    </div>

                    {/* Main Title */}
                    <div style={styles.mainTitle}>OFFICIAL CERTIFICATION</div>
                    <div style={styles.titleUnderline}></div>

                    {/* Awarded To */}
                    <div style={styles.awardedLabel}>AWARDED TO</div>
                    <div style={styles.studentName}>{studentName.toUpperCase()}</div>

                    {/* Certificate Type */}
                    <div style={styles.certificateType}>{certificateType}</div>

                    {/* Description */}
                    <div style={styles.description}>
                        {programDescription}
                    </div>

                    {/* Footer */}
                    <div style={styles.footer}>
                        {/* Date */}
                        <div style={styles.footerLeft}>
                            <div style={styles.footerLabel}>Date</div>
                            <div style={styles.footerValue}>{completionDate}</div>
                        </div>

                        {/* Signature */}
                        <div style={styles.footerCenter}>
                            <div style={styles.signatureSection}>
                                <div style={styles.signatureLine}>
                                    <div style={styles.signature}>Humoyun Anvarjonov</div>
                                </div>
                                <div style={styles.signerName}>Humoyun Anvarjonov</div>
                                <div style={styles.signerTitle}>Founder & CEO</div>
                            </div>
                        </div>

                        {/* Verification */}
                        <div style={styles.footerRight}>
                            <div style={styles.footerLabel}>Verification ID</div>
                            <div style={styles.footerValue}>{verificationId}</div>
                            <div style={styles.verifySection}>
                                <div style={styles.verifyLabel}>Verify at</div>
                                <div style={styles.verifyLink}>www.arabiyyapro.uz/verify</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    wrapper: {
        width: '100%',
        maxWidth: '850px',
        aspectRatio: '1.414 / 1', // A4 Landscape ratio approximation
        position: 'relative',
        margin: '0 auto',
        backgroundColor: 'white', // Ensure background is white for PDF
    },
    container: {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 20%, #1e40af 40%, #7c3aed 70%, #db2777 85%, #f59e0b 100%)',
        borderRadius: '25px', // Border radius might be cut off in PDF, but keeping for screen
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column'
    },
    waveOverlay: {
        position: 'absolute',
        inset: 0,
        background: `
      radial-gradient(ellipse at 80% 20%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 20% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 60%)
    `,
        pointerEvents: 'none',
    },
    curveDecoration: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
    },
    curve: {
        position: 'absolute',
        border: '3px solid rgba(251, 191, 36, 0.3)',
        borderRadius: '50%',
    },
    curveTop: {
        top: '-50px',
        right: '-100px',
        width: '500px',
        height: '300px',
        transform: 'rotate(25deg)',
    },
    curveBottom: {
        bottom: '-100px',
        left: '-150px',
        width: '600px',
        height: '350px',
        transform: 'rotate(-15deg)',
        borderColor: 'rgba(251, 191, 36, 0.2)',
    },
    content: {
        position: 'relative',
        zIndex: 1,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 60px', // Adjusted padding for better fit
        color: 'white',
        textAlign: 'center',
    },
    logoSection: {
        marginBottom: '15px',
    },
    logoIcon: {
        width: '40px',
        height: '40px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 8px',
        fontSize: '20px',
    },
    brandTitle: {
        fontSize: '16px',
        fontWeight: 700,
        letterSpacing: '2px',
        marginBottom: 0,
    },
    mainTitle: {
        fontSize: '32px', // Slightly smaller
        fontWeight: 700,
        letterSpacing: '4px',
        margin: '20px 0 10px',
        textTransform: 'uppercase',
    },
    titleUnderline: {
        width: '200px',
        height: '1px',
        background: 'rgba(255, 255, 255, 0.4)',
        margin: '0 auto 20px',
    },
    awardedLabel: {
        fontSize: '10px',
        fontWeight: 300,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '10px',
        opacity: 0.9,
    },
    studentName: {
        fontSize: '40px', // Prominent name
        fontWeight: 800,
        letterSpacing: '2px',
        margin: '5px 0 15px',
        textTransform: 'uppercase',
        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
    },
    certificateType: {
        fontSize: '16px',
        fontWeight: 600,
        color: '#fbbf24',
        letterSpacing: '1px',
        margin: '15px 0 10px',
    },
    description: {
        fontSize: '12px',
        fontWeight: 300,
        lineHeight: 1.5,
        maxWidth: '450px',
        margin: '0 auto 25px',
        opacity: 0.95,
    },
    footer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 'auto',
        // padding: '0 20px', // Removed extra padding
    },
    footerLeft: {
        textAlign: 'left',
        flex: 1,
    },
    footerCenter: {
        textAlign: 'center',
        flex: 1,
    },
    footerRight: {
        textAlign: 'right',
        flex: 1,
    },
    footerLabel: {
        fontSize: '8px',
        fontWeight: 300,
        letterSpacing: '0.5px',
        opacity: 0.8,
        marginBottom: '2px',
    },
    footerValue: {
        fontSize: '10px',
        fontWeight: 400,
        letterSpacing: '0.5px',
    },
    signatureSection: {
        marginBottom: '0px',
    },
    signatureLine: {
        width: '150px',
        height: '40px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        margin: '0 auto',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
    },
    signature: {
        fontFamily: "cursive", // Fallback font if Sacramento not loaded
        fontSize: '24px',
        color: '#fbbf24',
        marginBottom: '2px',
    },
    signerName: {
        fontSize: '10px',
        fontWeight: 600,
        marginTop: '4px',
    },
    signerTitle: {
        fontSize: '9px',
        fontWeight: 300,
        opacity: 0.8,
        marginTop: '1px',
    },
    verifySection: {
        marginTop: '4px',
    },
    verifyLabel: {
        fontSize: '8px',
        fontWeight: 300,
        opacity: 0.8,
        marginBottom: '1px',
    },
    verifyLink: {
        fontSize: '9px',
        fontWeight: 400,
        color: '#fbbf24',
    },
};

export default ArabiyyaCertificateFinal;
