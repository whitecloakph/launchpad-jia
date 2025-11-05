"use client"
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

export const CandidateCVDocument = ({ candidate, cvData, includeCVAnalysis = true }: any) => {
  
    const getSection = (name: string) => {
      const section = cvData?.find((section: any) => section.name === name);
      return section?.content?.split(`**${name}**`)[1]?.trim()?.replace(/\*\*/g, '') || section?.content?.trim()?.replace(/\*\*/g, '')  || '';
    }
      
    const styles = StyleSheet.create({
      page: { padding: 24, fontSize: 12, fontFamily: 'Helvetica', backgroundColor: '#fff' },
      headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderRadius: 8, borderWidth: 1, borderColor: '#E9EAEB', padding: 16, backgroundColor: '#fff' },
      avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
      avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#E0E0E0' },
      name: { fontWeight: 500, fontSize: 14, marginBottom: 2 },
      email: { fontSize: 12, color: '#787486' },
      jobFitCol: { flexDirection: 'column', alignItems: 'flex-end' },
      jobFitText: { fontSize: 12, marginBottom: 2 },
      jobTitle: { fontWeight: 600, fontSize: 13 },
      sectionRow: { flexDirection: 'row', gap: 16 },
      leftCol: { width: '60%', flexDirection: 'column', borderRightWidth: 1, borderRightColor: '#E9EAEB', paddingRight: 16 },
      rightCol: { width: '40%', flexDirection: 'column', paddingLeft: 16 },
      section: { marginBottom: 16 },
      sectionHeader: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
      divider: { height: 1, backgroundColor: '#E9EAEB', marginVertical: 12 },
      introSection: { marginBottom: 18 },
      noContent: { color: '#B0B0B0', fontStyle: 'italic' },
    });
  
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.avatarRow}>
              {candidate?.image && (
                <Image src={candidate.image} style={styles.avatar} />
              )}
              <View>
                <Text style={styles.name}>{candidate?.name}</Text>
                <Text style={styles.email}>{candidate?.email}</Text>
              </View>
            </View>
            {includeCVAnalysis && <View style={styles.jobFitCol}>
              <Text style={styles.jobFitText}>
                JIA thinks this candidate is a {candidate?.currentStep === 'CV Screening'
                  ? `CV: ${candidate?.cvStatus || 'N/A'}`
                  : `AI Interview: ${candidate?.jobFit || 'N/A'}`}
              </Text>
              <Text style={styles.jobTitle}>{candidate?.jobTitle}</Text>
            </View>}
          </View>
  
          {/* Introduction */}
          <View style={styles.introSection}>
            <Text style={styles.sectionHeader}>Introduction</Text>
            <Text>
              {getSection('Introduction') || <Text style={styles.noContent}>No introduction provided in CV</Text>}
            </Text>
          </View>
  
          {/* Two columns */}
          <View style={styles.sectionRow}>
            {/* Left Column */}
            <View style={styles.leftCol}>
              {/* Current Position */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Current Position</Text>
                <Text>
                  {getSection('Current Position') || <Text style={styles.noContent}>No current position provided in CV</Text>}
                </Text>
              </View>
              <View style={styles.divider} />
              {/* Experience */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Experience</Text>
                <Text>
                  {getSection('Experience') || <Text style={styles.noContent}>No experience provided in CV</Text>}
                </Text>
              </View>
              <View style={styles.divider} />
              {/* Education */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Education</Text>
                <Text>
                  {getSection('Education') || <Text style={styles.noContent}>No education provided in CV</Text>}
                </Text>
              </View>
              <View style={styles.divider} />
              {/* Skills */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Skills</Text>
                <Text>
                  {getSection('Skills') || <Text style={styles.noContent}>No skills provided in CV</Text>}
                </Text>
              </View>
            </View>
            {/* Right Column */}
            <View style={styles.rightCol}>
              {/* Contact Info */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Contact Information</Text>
                <Text>
                  {getSection('Contact Info') || <Text style={styles.noContent}>No contact information provided in CV</Text>}
                </Text>
              </View>
              <View style={styles.divider} />
              {/* Certifications */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Certifications</Text>
                <Text>
                  {getSection('Certifications') || <Text style={styles.noContent}>No certifications provided in CV</Text>}
                </Text>
              </View>
              <View style={styles.divider} />
              {/* Projects */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Projects</Text>
                <Text>
                  {getSection('Projects') || <Text style={styles.noContent}>No projects provided in CV</Text>}
                </Text>
              </View>
              <View style={styles.divider} />
              {/* Awards */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Awards</Text>
                <Text>
                  {getSection('Awards') || <Text style={styles.noContent}>No awards provided in CV</Text>}
                </Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );
  };