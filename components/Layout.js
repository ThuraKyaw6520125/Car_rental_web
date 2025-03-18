// File: components/Layout.js
import Head from 'next/head';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Mikey's Rentals</title>
        <meta name="description" content="Site for people to exchange vehicles" />
        <link rel="icon" href="/Logo.ico" />
      </Head>
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </>
  );
}