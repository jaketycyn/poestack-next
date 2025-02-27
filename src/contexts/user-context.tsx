import { gql, useMutation, useQuery } from "@apollo/client";
import { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "../__generated__/resolvers-types";

const initalContext: {
  jwt: string | null;
  profile: UserProfile | null;
  connect: any | null;
  logout: any | null;
} = {
  jwt: null,
  profile: null,
  connect: (code: string) => {},
  logout: () => {},
};

export const PoeStackAuthContext = createContext(initalContext);

export const localStorageJwtName = "doNotSharePoeStackAuthJwt";

export function PoeStackAuthProvider({ children }) {
  const [jwt, setJwt] = useState<string | null>(
    typeof window !== "undefined"
      ? localStorage.getItem(localStorageJwtName)
      : null
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [code, setCode] = useState<string | null>(null);
  const [connectAccount] = useMutation(
    gql`
      mutation ExchangeAuthCode($authCode: String!) {
        exchangeAuthCode(authCode: $authCode)
      }
    `,
    {
      variables: { authCode: code },
      onCompleted(data) {
        if (data?.exchangeAuthCode) {
          localStorage.setItem(localStorageJwtName, data?.exchangeAuthCode);
          setJwt(data?.exchangeAuthCode);
        }
      },
      onError(error) {
        console.log("error connecting auth code", error);
      },
    }
  );

  const { refetch: refetchMyProfile } = useQuery(
    gql`
      query MyProfile {
        myProfile {
          userId
          poeProfileName
          createdAtTimestamp
          lastConnectedTimestamp
          oAuthTokenUpdatedAtTimestamp
        }
      }
    `,
    {
      onCompleted(data) {
        const p: UserProfile = data?.myProfile;
        if (
          p.oAuthTokenUpdatedAtTimestamp &&
          new Date(p.oAuthTokenUpdatedAtTimestamp).valueOf() >
            Date.now() - 1000 * 60 * 60 * 24 * 14
        ) {
          setProfile(p);
        }
      },
    }
  );

  useEffect(() => {
    if (code?.length) {
      connectAccount();
    }
  }, [connectAccount, code]);

  useEffect(() => {
    refetchMyProfile();
  }, [jwt, refetchMyProfile]);

  function connect(code: string) {
    console.log("connect: " + code);
    if (code?.length) {
      setCode(code);
    }
  }

  function logout() {
    console.log("log out");
    localStorage.removeItem(localStorageJwtName);
    setJwt(null);
    setProfile(null);
  }

  const value = {
    profile: profile,
    jwt: jwt as any,
    connect: connect,
    logout: logout,
  };

  return (
    <PoeStackAuthContext.Provider value={value}>
      {children}
    </PoeStackAuthContext.Provider>
  );
}

export const usePoeStackAuth = () => useContext(PoeStackAuthContext);
