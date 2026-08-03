'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import WalletModal from './wallet-modal';

type LaunchDashboardButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants>;

export default function LaunchDashboardButton(props: LaunchDashboardButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  useEffect(() => {
    setWalletAddr(sessionStorage.getItem('wallet_address'));
  }, []);

  const handleClick = () => {
    if (walletAddr) {
      router.push('/dashboard');
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <Button {...props} onClick={handleClick} />
      {showModal && (
        <WalletModal
          onClose={() => setShowModal(false)}
          onConnected={() => {
            setShowModal(false);
            router.push('/dashboard');
          }}
        />
      )}
    </>
  );
}