'use client';

import { FC, ReactNode } from 'react';

interface PrintStylesProps {
  children: ReactNode;
}

const PrintStyles: FC<PrintStylesProps> = ({ children }) => {
  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            color: black;
            font-size: 11pt;
          }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          .avoid-break { page-break-inside: avoid; }
          @page {
            margin: 1.5cm;
            size: letter;
          }
        }
      `}</style>
      {children}
    </>
  );
};

export default PrintStyles;
