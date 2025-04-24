export const UsePlaySound = (sound: string) => {
  const audio = new Audio(sound);

  const play = async () => {
    audio.volume = 1.0;
    audio.currentTime = 0;
    audio.play();
  };

  return { play };
};
