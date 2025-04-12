"use client"

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Link, Image } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import type { GitHubUser, GitHubRepo, GitHubLanguage } from '@/lib/github'
import { useState, useEffect } from 'react'

function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    color: '#24292e',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottom: '1 solid #e1e4e8',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35, // Changed from '50%' to half of width/height
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerStats: {
    width: '25%',
    backgroundColor: '#f6f8fa',
    padding: 8,
    borderRadius: 3,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: '#586069',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 8,
    color: '#586069',
    marginBottom: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    color: '#24292e',
    backgroundColor: '#f6f8fa',
    padding: 4,
    borderRadius: 3,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillBadge: {
    backgroundColor: '#edf2f7',
    padding: '2 6',
    borderRadius: 2,
    fontSize: 8,
  },
  projectItem: {
    marginBottom: 8,
    padding: 6,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    border: '1 solid #e1e4e8',
  },
  projectTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 8,
    color: '#586069',
    marginBottom: 4,
  },
  projectStats: {
    flexDirection: 'row',
    gap: 10,
    fontSize: 8,
    color: '#586069',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  link: {
    color: '#0366d6',
    textDecoration: 'none',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 8,
    color: '#586069',
    textAlign: 'center',
    borderTop: '1 solid #e1e4e8',
    paddingTop: 8,
  },
  statLabel: {
    fontSize: 8,
    color: '#586069',
  },
  statValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#24292e',
  },
})

interface CVDocumentProps {
  user: GitHubUser
  repos: GitHubRepo[]
  languages: GitHubLanguage[]
}

const CVDocument = ({ user, repos, languages }: CVDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image
          src={user.avatar_url}
          style={styles.avatar}
        />
        <View style={styles.headerContent}>
          <Text style={styles.name}>{user.name || user.login}</Text>
          <Text style={styles.title}>GitHub Developer Profile</Text>
          {user.email && <Text style={styles.contactInfo}>{user.email}</Text>}
          {user.location && <Text style={styles.contactInfo}>{user.location}</Text>}
          {user.blog && <Text style={styles.contactInfo}>{user.blog}</Text>}
          <Link src={user.html_url} style={[styles.contactInfo, styles.link]}>
            {user.html_url}
          </Link>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statLabel}>Public Repos</Text>
          <Text style={styles.statValue}>{user.public_repos}</Text>
          <Text style={styles.statLabel}>Followers</Text>
          <Text style={styles.statValue}>{user.followers}</Text>
        </View>
      </View>

      {user.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={{ fontSize: 9, color: '#586069' }}>{user.bio}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technical Skills</Text>
        <View style={styles.skillsGrid}>
          {languages.slice(0, 10).map((lang) => (
            <View key={lang.name} style={styles.skillBadge}>
              <Text>{lang.name} ({lang.percentage.toFixed(1)}%)</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notable Projects</Text>
        {repos
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 4)
          .map((repo) => (
            <View key={repo.id} style={styles.projectItem}>
              <Text style={styles.projectTitle}>{sanitizeText(repo.name)}</Text>
              <Text style={styles.projectDescription}>{sanitizeText(repo.description)}</Text>
              <View style={styles.projectStats}>
                <View style={styles.statItem}>
                  <Text>⭐ {repo.stargazers_count}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text>🍴 {repo.forks_count}</Text>
                </View>
                {repo.language && (
                  <View style={styles.statItem}>
                    <Text>📝 {sanitizeText(repo.language)}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
      </View>

      <View style={styles.footer}>
        <Text>Generated from GitHub Profile • {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
)

interface GitHubCVGeneratorProps {
  user: GitHubUser
  repos: GitHubRepo[]
  languages: GitHubLanguage[]
}

export function GitHubCVGenerator({ user, repos, languages }: GitHubCVGeneratorProps) {
  const [isClient, setIsClient] = useState(false)

  // Use useEffect to ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <Button disabled>Loading PDF Generator...</Button>
  }

  return (
    <PDFDownloadLink
      document={<CVDocument user={user} repos={repos} languages={languages} />}
      fileName={`${user.login}-github-cv.pdf`}
      className="block"
    >
      {({ blob, url, loading, error }) => {
        if (error) {
          console.error('PDF generation error:', error)
          return <Button disabled>Error generating PDF</Button>
        }
        
        return (
          <Button disabled={loading}>
            {loading ? 'Generating CV...' : 'Export to PDF'}
          </Button>
        )
      }}
    </PDFDownloadLink>
  )
}
