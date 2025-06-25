package stat

func CalcStat(baseStat uint16, level uint8) uint16 {
	result := (baseStat*2+31+(0/4))*uint16(level)/100 + 5
	return result
}

func CalcHpStat(baseStat uint16, level uint8) uint16 {
	result := ((baseStat*2 + 31 + (0 / 4) + 100) * uint16(level) / 100) + 10
	return result
}
