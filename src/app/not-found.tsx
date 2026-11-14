import { Coin } from "@/components/ui/Coin";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        alignContent: "center",
        gap: 20,
        padding: "24px var(--gutter)",
        textAlign: "center",
      }}
    >
      <Coin size={96} />
      <h1 style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}>Oops! That page rolled away.</h1>
      <p style={{ maxWidth: "26ch", fontSize: 22, fontWeight: 700 }}>
        Let&apos;s head back and find your jobs.
      </p>
      <ButtonLink href="/" variant="primary" size="kid" pill>
        Back to the start
      </ButtonLink>
    </main>
  );
}
